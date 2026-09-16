import { School } from '../types';
import canadaSchools from './canada_schools_0912.json';

export const schools: School[] = canadaSchools as unknown as School[];
