import { School } from '../types';
import canadaSchools from './canada_schools.json';

export const schools: School[] = canadaSchools as unknown as School[];
