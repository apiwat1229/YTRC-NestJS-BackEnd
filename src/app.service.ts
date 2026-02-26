import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    private readonly startupTime = new Date();

    getHealth() {
        const now = new Date();
        const uptimeSeconds = process.uptime();

        return {
            "Status": "✅ YTRC Center API running!",
            "Project": "YTRC Center",
            "Startup Time": this.formatDate(this.startupTime),
            "Uptime": this.formatDuration(uptimeSeconds),
            "Server Time": this.formatDate(now),
            "Redis Status": "⚠️ Not Configured",
            "Online Users (Real-time)": 0
        };
    }

    private formatDate(date: Date): string {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const day = date.getDate().toString().padStart(2, '0');
        const month = months[date.getMonth()];
        const year = date.getFullYear();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${day}-${month}-${year} เวลา ${hours} Hour ${minutes} : Minute : ${seconds} Second`;
    }

    private formatDuration(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        return `${hours} Hour ${minutes} : Minute : ${secs} Second`;
    }
}
