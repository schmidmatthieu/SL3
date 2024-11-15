'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'  // Optionnel, pour le typage

export const supabase = createClientComponentClient<Database>()