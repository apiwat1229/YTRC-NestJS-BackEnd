import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { ApprovalsService } from '../approvals/approvals.service';
import { Booking, BookingLabSample } from '../entities/booking.entity';
import { NotificationsService } from '../notifications/notifications.service';

const SLOT_QUEUE_CONFIG: Record<string, { start: number; limit: number | null }> = {
    '08:00-09:00': { start: 1, limit: 4 },
    '09:00-10:00': { start: 5, limit: 4 },
    '10:00-11:00': { start: 9, limit: null },
    '11:00-12:00': { start: 13, limit: 4 },
    '13:00-14:00': { start: 17, limit: null },
};

function getSlotConfig(slot: string, date: Date) {
    const dayOfWeek = new Date(date).getUTCDay();
    if (dayOfWeek === 6 && slot === '10:00-11:00') return { start: 9, limit: null };
    return SLOT_QUEUE_CONFIG[slot] ?? { start: 1, limit: null };
}

function genBookingCode(date: Date, queueNo: number): string {
    const d = new Date(date);
    const yy = String(d.getFullYear()).slice(-2);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const q = String(queueNo).padStart(2, '0');
    return `${yy}${mm}${dd}${q}`;
}

const safeParseFloat = (val: any): number | null | undefined => {
    if (val === undefined) return undefined;
    if (val === null || val === '') return null;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? null : parsed;
};

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingRepo: Repository<Booking>,
        @InjectRepository(BookingLabSample)
        private sampleRepo: Repository<BookingLabSample>,
        private notificationsService: NotificationsService,
        private approvalsService: ApprovalsService
    ) { }

    async create(data: any) {
        const { date, startTime, endTime, supplierId, supplierCode, supplierName, truckType, truckRegister, rubberType, estimatedWeight, recorder } = data;
        const slot = `${startTime}-${endTime}`;
        const slotConfig = getSlotConfig(slot, new Date(date));
        const d = new Date(date);
        const yy = String(d.getFullYear()).slice(-2);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const codePrefix = `${yy}${mm}${dd}`;

        const dayBookings = await this.bookingRepo.find({
            where: { date: new Date(date), deletedAt: IsNull() },
        });

        const isUSS = rubberType && rubberType.toUpperCase().includes('USS');
        const prefix = isUSS ? 'U' : 'C';
        const relevantBookings = dayBookings.filter(b => {
            const bIsUSS = b.rubberType && b.rubberType.toUpperCase().includes('USS');
            return bIsUSS === isUSS;
        });

        const activeBookingsInSlot = relevantBookings.filter(b => b.slot === slot && !b.deletedAt);
        if (slotConfig.limit && activeBookingsInSlot.length >= slotConfig.limit) {
            throw new BadRequestException(`This time slot is full for ${isUSS ? 'USS' : 'Cuplump'}`);
        }

        if (truckRegister) {
            const duplicateBooking = dayBookings.find(b =>
                !b.deletedAt && b.checkinAt === null && b.supplierId === supplierId && b.slot === slot && b.truckRegister === truckRegister
            );
            if (duplicateBooking) throw new BadRequestException(`This truck (${truckRegister}) already has a booking for this slot.`);
        }

        const existingBookingsForQueue = isUSS ? relevantBookings : relevantBookings.filter(b => b.slot === slot);
        const usedNumbers = existingBookingsForQueue.map(b => b.queueNo).sort((a, b) => a - b);
        let queueNo = slotConfig.start;
        for (const num of usedNumbers) {
            if (num === queueNo) queueNo++;
            else if (num > queueNo) break;
        }

        let bookingCode = prefix + genBookingCode(new Date(date), queueNo);
        const allCodesToday = new Set(dayBookings.map(b => b.bookingCode));
        while (allCodesToday.has(bookingCode)) {
            queueNo++;
            bookingCode = prefix + genBookingCode(new Date(date), queueNo);
        }

        const finalDuplicate = await this.bookingRepo.findOne({ where: { bookingCode } });
        if (finalDuplicate) {
            if (finalDuplicate.deletedAt) {
                await this.bookingRepo.update(finalDuplicate.id, { bookingCode: `STALE-${finalDuplicate.bookingCode}-${Date.now()}` });
            } else {
                const maxBooking = await this.bookingRepo
                    .createQueryBuilder('b')
                    .where('b.bookingCode LIKE :prefix AND b.deletedAt IS NULL', { prefix: `${prefix}${codePrefix}%` })
                    .orderBy('b.queueNo', 'DESC')
                    .select(['b.queueNo'])
                    .getOne();
                queueNo = ((maxBooking?.queueNo || queueNo) + 1);
                bookingCode = prefix + genBookingCode(new Date(date), queueNo);
            }
        }

        try {
            const booking = this.bookingRepo.create({
                queueNo, bookingCode, date: new Date(date), startTime, endTime, slot,
                supplierId, supplierCode, supplierName, truckType, truckRegister, rubberType,
                estimatedWeight: estimatedWeight ? parseFloat(estimatedWeight) : null, recorder,
            });
            const created = await this.bookingRepo.save(booking);
            await this.triggerNotification('Booking', 'CREATE', {
                title: 'New Booking Created',
                message: `Booking ${bookingCode} created for ${supplierName} at ${slot}`,
                actionUrl: `/bookings/${bookingCode}`,
            });
            return created;
        } catch (error: any) {
            throw new BadRequestException(`Failed to create booking: ${error.message || 'Unknown error'}`);
        }
    }

    async checkIn(id: string, data?: any, user?: any) {
        const booking = await this.findOne(id);
        if (booking.checkinAt) throw new BadRequestException('This booking has already been checked in.');
        await this.bookingRepo.update(id, {
            checkinAt: new Date(),
            checkedInBy: user?.displayName || user?.username || 'System',
            truckType: data?.truckType,
            truckRegister: data?.truckRegister,
            note: data?.note,
        });
        return this.findOne(id);
    }

    async startDrain(id: string, user?: any) {
        await this.bookingRepo.update(id, { startDrainAt: new Date(), startDrainBy: user?.displayName || user?.username || 'System' });
        return this.findOne(id);
    }

    async stopDrain(id: string, data?: any, user?: any) {
        await this.bookingRepo.update(id, { stopDrainAt: new Date(), stopDrainBy: user?.displayName || user?.username || 'System', drainNote: data?.note });
        return this.findOne(id);
    }

    async saveWeightIn(id: string, data: any, user?: any) {
        await this.bookingRepo.update(id, {
            rubberSource: data.rubberSource, rubberType: data.rubberType,
            weightIn: parseFloat(data.weightIn), weightInBy: user?.displayName || user?.username || 'System',
            trailerRubberSource: data.trailerRubberSource, trailerRubberType: data.trailerRubberType,
            trailerWeightIn: data.trailerWeightIn ? parseFloat(data.trailerWeightIn) : null,
        });
        return this.findOne(id);
    }

    async saveWeightOut(id: string, data: any, user?: any) {
        await this.bookingRepo.update(id, { weightOut: parseFloat(data.weightOut), weightOutBy: user?.displayName || user?.username || 'System' });
        return this.findOne(id);
    }

    async findAll(date?: string, slot?: string, code?: string) {
        const qb = this.bookingRepo.createQueryBuilder('b').leftJoinAndSelect('b.labSamples', 'ls');
        if (code) {
            qb.where('b.bookingCode = :code OR b.bookingCode LIKE :cancelled', { code, cancelled: `CANCELLED-${code}-%` });
        } else {
            if (date) qb.andWhere('b.date = :date', { date: new Date(date) });
            if (slot) qb.andWhere('b.slot = :slot', { slot });
            qb.andWhere('b.deletedAt IS NULL');
        }
        return qb.orderBy('b.queueNo', 'ASC').getMany();
    }

    async findOne(id: string) {
        const booking = await this.bookingRepo.findOne({ where: { id } });
        if (!booking) throw new NotFoundException(`Booking with ID ${id} not found`);
        return booking;
    }

    async update(id: string, data: any, user?: any) {
        await this.findOne(id);
        const safeFloat = (val: any) => safeParseFloat(val);
        const updateData: any = {
            supplierId: data.supplierId, supplierCode: data.supplierCode, supplierName: data.supplierName,
            truckType: data.truckType, truckRegister: data.truckRegister, rubberType: data.rubberType,
            estimatedWeight: safeFloat(data.estimatedWeight), recorder: data.recorder,
            lotNo: data.lotNo, trailerLotNo: data.trailerLotNo,
            moisture: safeFloat(data.moisture), drcEst: safeFloat(data.drcEst),
            drcRequested: safeFloat(data.drcRequested), drcActual: safeFloat(data.drcActual),
            trailerMoisture: safeFloat(data.trailerMoisture), trailerDrcEst: safeFloat(data.trailerDrcEst),
            trailerDrcRequested: safeFloat(data.trailerDrcRequested), trailerDrcActual: safeFloat(data.trailerDrcActual),
            weightIn: safeFloat(data.weightIn), weightOut: safeFloat(data.weightOut),
            trailerWeightIn: safeFloat(data.trailerWeightIn), trailerWeightOut: safeFloat(data.trailerWeightOut),
        };

        if (data.status === 'APPROVED') {
            updateData.status = 'APPROVED';
            updateData.approvedBy = user?.displayName || user?.username || 'System';
            updateData.approvedAt = new Date();
        }

        try {
            await this.bookingRepo.update(id, updateData);
            const result = await this.findOne(id);
            if (!data.silent) {
                await this.triggerNotification('Booking', 'UPDATE', {
                    title: 'Booking Updated',
                    message: `Booking ${result.bookingCode} (${result.supplierName}) at ${result.slot} has been updated.`,
                    actionUrl: `/bookings?code=${result.bookingCode}`,
                });
            }
            return result;
        } catch (error: any) {
            throw new BadRequestException(`Failed to update booking: ${error.message || 'Unknown error'}`);
        }
    }

    async remove(id: string, user?: any) {
        const booking = await this.findOne(id);
        try {
            await this.bookingRepo.update(id, {
                deletedAt: new Date(),
                deletedBy: user?.displayName || user?.username || 'System',
                status: 'CANCELLED',
                bookingCode: `CANCELLED-${booking.bookingCode}-${Date.now()}`,
            });
            await this.triggerNotification('Booking', 'DELETE', {
                title: 'Booking Cancelled',
                message: `Booking ${booking.bookingCode} (${booking.supplierName}) at ${booking.slot} has been cancelled.`,
                actionUrl: `/bookings/${booking.bookingCode}`,
            });
            return this.findOne(id);
        } catch (error) {
            throw error;
        }
    }

    private async triggerNotification(sourceApp: string, actionType: string, payload: { title: string; message: string; actionUrl?: string }) {
        // Simplified - notifications can be configured via NotificationSetting in the future
        console.log(`[BookingsService] Trigger notification ${sourceApp}:${actionType} - ${payload.title}`);
    }

    async getStats(date: string) {
        const bookings = await this.findAll(date);
        const total = bookings.length;
        const checkedIn = bookings.filter(b => b.checkinAt).length;
        const pending = total - checkedIn;
        const slotStats: Record<string, any> = {};
        Object.keys(SLOT_QUEUE_CONFIG).forEach(slot => {
            const slotBookings = bookings.filter(b => b.slot === slot);
            slotStats[slot] = { count: slotBookings.length, checkedIn: slotBookings.filter(b => b.checkinAt).length, bookings: slotBookings };
        });
        return { total, checkedIn, pending, slots: slotStats };
    }

    async getSamples(bookingId: string) {
        return this.sampleRepo.find({ where: { bookingId }, order: { sampleNo: 'ASC' } });
    }

    async saveSample(bookingId: string, data: any) {
        const isTrailer = data.isTrailer === true || data.isTrailer === 'true';

        if (data.id) {
            const existing = await this.sampleRepo.findOne({ where: { id: data.id } });
            if (existing) {
                const updatePayload: any = {
                    beforePress: safeParseFloat(data.beforePress), basketWeight: safeParseFloat(data.basketWeight),
                    cuplumpWeight: safeParseFloat(data.cuplumpWeight), afterPress: safeParseFloat(data.afterPress),
                    percentCp: safeParseFloat(data.percentCp),
                    beforeBaking1: safeParseFloat(data.beforeBaking1), beforeBaking2: safeParseFloat(data.beforeBaking2),
                    beforeBaking3: safeParseFloat(data.beforeBaking3),
                    afterDryerB1: safeParseFloat(data.afterDryerB1), beforeLabDryerB1: safeParseFloat(data.beforeLabDryerB1),
                    afterLabDryerB1: safeParseFloat(data.afterLabDryerB1), drcB1: safeParseFloat(data.drcB1),
                    moisturePercentB1: safeParseFloat(data.moisturePercentB1), drcDryB1: safeParseFloat(data.drcDryB1),
                    labDrcB1: safeParseFloat(data.labDrcB1), recalDrcB1: safeParseFloat(data.recalDrcB1),
                    afterDryerB2: safeParseFloat(data.afterDryerB2), beforeLabDryerB2: safeParseFloat(data.beforeLabDryerB2),
                    afterLabDryerB2: safeParseFloat(data.afterLabDryerB2), drcB2: safeParseFloat(data.drcB2),
                    moisturePercentB2: safeParseFloat(data.moisturePercentB2), drcDryB2: safeParseFloat(data.drcDryB2),
                    labDrcB2: safeParseFloat(data.labDrcB2), recalDrcB2: safeParseFloat(data.recalDrcB2),
                    afterDryerB3: safeParseFloat(data.afterDryerB3), beforeLabDryerB3: safeParseFloat(data.beforeLabDryerB3),
                    afterLabDryerB3: safeParseFloat(data.afterLabDryerB3), drcB3: safeParseFloat(data.drcB3),
                    moisturePercentB3: safeParseFloat(data.moisturePercentB3), drcDryB3: safeParseFloat(data.drcDryB3),
                    labDrcB3: safeParseFloat(data.labDrcB3), recalDrcB3: safeParseFloat(data.recalDrcB3),
                    drc: safeParseFloat(data.drc), moistureFactor: safeParseFloat(data.moistureFactor),
                    recalDrc: safeParseFloat(data.recalDrc), difference: safeParseFloat(data.difference),
                    p0: safeParseFloat(data.p0), p30: safeParseFloat(data.p30), pri: safeParseFloat(data.pri),
                    storage: data.storage, recordedBy: data.recordedBy,
                };
                await this.sampleRepo.update(data.id, updatePayload);
                return this.sampleRepo.findOne({ where: { id: data.id } });
            }
        }

        let sampleNo = data.sampleNo;
        if (!sampleNo) {
            const last = await this.sampleRepo.findOne({ where: { bookingId, isTrailer }, order: { sampleNo: 'DESC' } });
            sampleNo = (last?.sampleNo || 0) + 1;
        }

        const sample = this.sampleRepo.create({
            bookingId, sampleNo, isTrailer,
            beforePress: safeParseFloat(data.beforePress), basketWeight: safeParseFloat(data.basketWeight),
            cuplumpWeight: safeParseFloat(data.cuplumpWeight), afterPress: safeParseFloat(data.afterPress),
            percentCp: safeParseFloat(data.percentCp),
            beforeBaking1: safeParseFloat(data.beforeBaking1), beforeBaking2: safeParseFloat(data.beforeBaking2),
            beforeBaking3: safeParseFloat(data.beforeBaking3),
            p0: safeParseFloat(data.p0), p30: safeParseFloat(data.p30), pri: safeParseFloat(data.pri),
            storage: data.storage, recordedBy: data.recordedBy,
        } as any);

        const result = await this.sampleRepo.save(sample);
        await this.updateBookingLabStats(bookingId);
        return result;
    }

    async deleteSample(bookingId: string, sampleId: string) {
        const result = await this.sampleRepo.delete(sampleId);
        await this.updateBookingLabStats(bookingId);
        return result;
    }

    private async updateBookingLabStats(bookingId: string) {
        const samples = await this.sampleRepo.find({ where: { bookingId } });
        const mainSamples = samples.filter(s => !s.isTrailer);
        const updateData: any = {};
        const validCp = mainSamples.filter(s => s.percentCp && s.percentCp > 0);
        if (validCp.length > 0) {
            const avgCp = validCp.reduce((sum, s) => sum + s.percentCp, 0) / validCp.length;
            updateData.drcEst = avgCp;
            updateData.cpAvg = avgCp;
        }
        if (Object.keys(updateData).length > 0) {
            await this.bookingRepo.update(bookingId, updateData);
        }
    }
}
