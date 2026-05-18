import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useSignupMutation } from '../../store/api/user/authApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { getApiErrorMessage } from '../../utils/errorMessage';

import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const signupSchema = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    pass: z.string().min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
    confirmPass: z.string().min(6, { message: 'Nhập lại mật khẩu' }),
    fullName: z.string().min(2, { message: 'Họ tên quá ngắn' }),
    birthday: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Ngày sinh không hợp lệ',
    }),
    phone: z.string().regex(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    city: z.string().min(1, { message: 'Vui lòng chọn thành phố' }),
    address: z.string().min(5, { message: 'Địa chỉ quá ngắn' }),
  })
  .refine((data) => data.pass === data.confirmPass, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPass'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

const RegisterPage: React.FC = () => {
  const [signup, { isLoading }] = useSignupMutation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [registerError, setRegisterError] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      gender: 'MALE',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      setRegisterError('');
      const { confirmPass: _c, ...payload } = data;
      await signup(payload).unwrap();
      toast.success(t('auth.signup_success'));
      navigate('/login');
    } catch (err: unknown) {
      console.error('Signup failed:', err);
      const fallbackMessage = 'Registration failed. Please try again.';
      const translatedMessage = t('auth.signup_failed');
      const defaultMessage = translatedMessage === 'auth.signup_failed' ? fallbackMessage : translatedMessage;
      const errorMessage = getApiErrorMessage(err, defaultMessage);
      setRegisterError(errorMessage);
    }
  };

  return (
    <div className="flex min-h-full items-center justify-center px-3 py-8 sm:px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:max-w-lg sm:p-8">
        <div>
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            {t('auth.title_signup')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t('auth.signin')}
            </Link>
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label={t('auth.fullname')}
            placeholder={t('auth.fullname')}
            register={register('fullName')}
            error={errors.fullName?.message}
          />
          <Input
            label={t('auth.email')}
            type="email"
            placeholder="name@example.com"
            register={register('email')}
            error={errors.email?.message}
          />
          <Input
            label={t('auth.password')}
            type="password"
            placeholder="••••••••"
            register={register('pass')}
            error={errors.pass?.message}
          />
          <Input
            label={t('auth.confirm_password')}
            type="password"
            placeholder="••••••••"
            register={register('confirmPass')}
            error={errors.confirmPass?.message}
          />
          <Input
            label={t('auth.phone')}
            placeholder="0912345678"
            register={register('phone')}
            error={errors.phone?.message}
          />
          <Input
            label={t('auth.birthday')}
            type="date"
            register={register('birthday')}
            error={errors.birthday?.message}
          />
          <div className="w-full space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('auth.gender')}
            </label>
            <select
              {...register('gender')}
              className={`h-11 w-full rounded-lg border bg-white px-4 py-2 text-slate-900 transition-all focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${
                errors.gender ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <option value="MALE">{t('auth.male')}</option>
              <option value="FEMALE">{t('auth.female')}</option>
              <option value="OTHER">{t('auth.other')}</option>
            </select>
            {errors.gender && <p className="text-xs text-red-500">{errors.gender.message}</p>}
          </div>
          <Input
            label={t('auth.city')}
            placeholder={t('auth.city')}
            register={register('city')}
            error={errors.city?.message}
          />
          <Input
            label={t('auth.address')}
            placeholder={t('auth.address')}
            register={register('address')}
            error={errors.address?.message}
          />

          <Button type="submit" className="w-full py-3 text-base sm:text-lg" isLoading={isLoading}>
            {t('auth.signup')}
          </Button>
        </form>
      </div>

      <Modal
        isOpen={!!registerError}
        onClose={() => setRegisterError('')}
        title={t('auth.signup_failed') === 'auth.signup_failed' ? 'Registration Failed' : t('auth.signup_failed')}
        variant="error"
      >
        <div className="flex h-full min-h-0 flex-col justify-between gap-4">
          <p className="text-center text-sm font-medium leading-relaxed text-red-800 dark:text-red-200">
            {registerError}
          </p>
          <Button type="button" variant="danger" className="w-full" onClick={() => setRegisterError('')}>
            OK
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default RegisterPage;
