import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useSigninMutation } from '../../store/api/user/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { ShieldCheck, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getApiErrorMessage } from '../../utils/errorMessage';
import { toast } from 'sonner';

const adminLoginSchema = z.object({
  email: z.string().email({ message: 'Email không hợp lệ' }),
  pass: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

type AdminLoginFormValues = z.infer<typeof adminLoginSchema>;

const AdminLoginPage: React.FC = () => {
  const [signin, { isLoading }] = useSigninMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginError, setLoginError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  });

  const onSubmit = async (data: AdminLoginFormValues) => {
    try {
      setLoginError('');
      const response = await signin(data).unwrap();
      
      // Strict role check for Admin
      const isAdmin = response.user.roleName?.toUpperCase().includes('ADMIN');
      
      if (isAdmin) {
        dispatch(setCredentials(response));
        toast.success(t('toast.login_success'));
        navigate('/admin');
      } else {
        setLoginError('Access denied. You do not have administrator privileges.');
      }
    } catch (err: unknown) {
      console.error('Admin login failed:', err);
      const fallbackMessage = 'Login failed. Please check your credentials and try again.';
      const translatedMessage = t('auth.login_failed');
      const defaultMessage = translatedMessage === 'auth.login_failed' ? fallbackMessage : translatedMessage;
      const errorMessage = getApiErrorMessage(err, defaultMessage);
      setLoginError(errorMessage);
    }
  };

  return (
    <div className="flex h-full items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30">
            <ShieldCheck className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {t('auth.title_admin_signin')}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Secure access for authorized administrators only
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <Input
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              placeholder="admin@questmanager.com"
              register={register('email')}
              error={errors.email?.message}
            />
            <div className="relative">
              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                register={register('pass')}
                error={errors.pass?.message}
              />
            </div>
          </div>
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl dark:bg-slate-800/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600">
              <Lock className="h-4 w-4" />
              Two-factor auth enabled
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full rounded-xl py-3 text-base shadow-xl shadow-primary-500/20"
              isLoading={isLoading}
            >
              Access Dashboard
            </Button>
          </div>
        </form>
        
        <p className="text-center text-xs text-slate-400">
          Unauthorized access attempts are logged and monitored.
        </p>
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

export default AdminLoginPage;
