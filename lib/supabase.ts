import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vxzlreptcvyxhezowgyw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ4emxyZXB0Y3Z5eGhlem93Z3l3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NDkyMDMsImV4cCI6MjA4NDQyNTIwM30.veTaDgGK_W7zf7kBRwfcq_hRU0ZG26GzwltEl_pTljg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);