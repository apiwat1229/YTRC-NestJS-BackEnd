import { SetMetadata } from '@nestjs/common';
import { Role } from '../../types/index';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
