import { SetMetadata } from '@nestjs/common';
import type { Perfil } from '../generated/prisma/enums.js';

export const IS_PUBLIC_KEY = 'isPublic';
export const PROFILES_KEY = 'profiles';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

export const Profiles = (...perfis: Perfil[]) => SetMetadata(PROFILES_KEY, perfis);
