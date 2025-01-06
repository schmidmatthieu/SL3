import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Créer un client avec la clé service_role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    console.log('Starting user creation process:', { email, username });

    // 1. Créer l'utilisateur
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

    if (signUpError) {
      console.error('Auth error:', signUpError);
      throw signUpError;
    }

    if (!authData.user) {
      console.error('No user returned');
      throw new Error('User creation failed');
    }

    console.log('User created successfully:', authData.user.id);

    // 2. Créer le profil
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          username,
          email,
          role: 'user',
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      throw profileError;
    }

    console.log('Profile created successfully:', profileData);

    return NextResponse.json(
      {
        user: authData.user,
        profile: profileData,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Signup process error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
