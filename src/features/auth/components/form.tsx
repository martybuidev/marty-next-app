'use client';

import { loginSchema, TLoginInput } from '@/modules/auth/schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

export function Form() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TLoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    await signIn('credentials', {
      email,
      password,
      redirectTo: '/'
    });
  });

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label htmlFor="email">Email</label>
        <input type="email" id="email" {...register('email')} />
        {errors.email?.message}
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" {...register('password')} />
        {errors.password?.message}
      </div>
      <button type="submit">Login</button>
      <br />
      <button type="button" onClick={()=>signIn('google', { redirectTo: '/' }, { prompt: 'select_account' })}>
        Login with Google
      </button>
      <br />
      <button type="button" onClick={()=>signIn('github', { redirectTo: '/' }, { prompt: 'consent' })}>
        Login with Github
      </button>
      <br />
      <button type="button" onClick={()=>signIn('facebook', { redirectTo: '/' }, { prompt: 'reauthenticate' })}>
        Login with Facebook
      </button>
    </form>
  );
}
