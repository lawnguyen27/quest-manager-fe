import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useSigninMutation } from '../../store/api/user/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { getApiErrorMessage } from '../../utils/errorMessage';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  pass: z.string().min(6, { message: 'Mật khẩu phải có nhất 6 ký tự' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  const [signin, { isLoading }] = useSigninMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginError, setLoginError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setLoginError('');
      const response = await signin(data).unwrap();
      dispatch(setCredentials(response));
      toast.success(t('toast.login_success'));

      const isAdmin = response.user.roleName?.toUpperCase().includes('ADMIN');

      if (isAdmin) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: unknown) {
      console.error('Login failed:', err);
      const fallbackMessage = 'Login failed. Please check your credentials and try again.';
      const translatedMessage = t('auth.login_failed');
      const defaultMessage = translatedMessage === 'auth.login_failed' ? fallbackMessage : translatedMessage;
      const errorMessage = getApiErrorMessage(err, defaultMessage);
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="flex h-full items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {t('auth.title_signin')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {t('auth.no_account')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.signup')}
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 rounded-md shadow-sm">
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder="name@example.com"
              register={register('email')}
              error={errors.email?.message}
            />
            <Input
              label={t('auth.password')}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              register={register('pass')}
              error={errors.pass?.message}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-900 dark:text-slate-300"
              >
                {t('auth.remember_me')}
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('auth.forgot_password')}
              </a>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              {t('auth.signin')}
            </Button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={!!loginError}
        onClose={() => setLoginError('')}
        title={t('auth.login_failed') === 'auth.login_failed' ? 'Login Failed' : t('auth.login_failed')}
        variant="error"
      >
        <div className="flex h-full min-h-0 flex-col justify-between gap-4">
          <p className="text-center text-sm font-medium leading-relaxed text-red-800 dark:text-red-200">
            {loginError}
          </p>
          <Button
            type="button"
            variant="danger"
            className="w-full"
            onClick={() => setLoginError('')}
          >
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default LoginPage;
