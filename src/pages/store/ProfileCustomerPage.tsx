import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetMeQuery, useUpdateMeMutation } from '../../store/api/user/userApi';
import { useSendVerificationEmailMutation, useVerifyEmailMutation } from '../../store/api/user/authApi';
import { useGetMyWalletQuery } from '../../store/api/wallet/walletApi';
import { User, MapPin, Phone, Mail, Calendar, Coins, BadgeCheck } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { getApiErrorMessage } from '../../utils/errorMessage';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

const basicProfileSchema = z.object({
  fullName: z.string().min(2, { message: 'Họ tên quá ngắn' }),
  phone: z.string().regex(/^[0-9]{10,11}$/, { message: 'Số điện thoại không hợp lệ' }),
  birthday: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Ngày sinh không hợp lệ',
  }),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  city: z.string().min(1, { message: 'Thành phố không được để trống' }),
  address: z.string().min(5, { message: 'Địa chỉ quá ngắn' }),
});

type BasicProfileValues = z.infer<typeof basicProfileSchema>;

const changePasswordSchema = z
  .object({
    newPass: z.string().min(6, { message: 'Mật khẩu ít nhất 6 ký tự' }),
    confirmPass: z.string().min(6, { message: 'Xác nhận mật khẩu' }),
  })
  .refine((d) => d.newPass === d.confirmPass, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPass'],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

const toDateInput = (v?: string) => {
  if (!v) return '';
  return String(v).slice(0, 10);
};

const ProfileCustomerPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: profile, isLoading: isProfileLoading } = useGetMeQuery();
  const { data: wallet, isLoading: isWalletLoading } = useGetMyWalletQuery();
  const [updateMe, { isLoading: isUpdating }] = useUpdateMeMutation();
  const [sendVerificationEmail, { isLoading: isSendingCode }] = useSendVerificationEmailMutation();
  const [verifyEmail, { isLoading: isVerifyingEmail }] = useVerifyEmailMutation();

  const [basicOpen, setBasicOpen] = React.useState(false);
  const [pwOpen, setPwOpen] = React.useState(false);
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [verifyCode, setVerifyCode] = React.useState('');
  const [verifyError, setVerifyError] = React.useState('');
  const [basicError, setBasicError] = React.useState('');
  const [pwError, setPwError] = React.useState('');

  const basicForm = useForm<BasicProfileValues>({
    resolver: zodResolver(basicProfileSchema),
  });

  const pwForm = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { newPass: '', confirmPass: '' },
  });

  const {
    reset: resetBasic,
    register: regBasic,
    handleSubmit: submitBasic,
    formState: { errors: basicErrors },
  } = basicForm;
  const {
    reset: resetPw,
    register: regPw,
    handleSubmit: submitPw,
    formState: { errors: pwErrors },
  } = pwForm;

  React.useEffect(() => {
    if (basicOpen && profile) {
      setBasicError('');
      resetBasic({
        fullName: profile.fullName ?? '',
        phone: profile.phone ?? '',
        birthday: toDateInput(profile.birthday),
        gender: (profile.gender as BasicProfileValues['gender']) || 'MALE',
        city: profile.city ?? '',
        address: profile.address ?? '',
      });
    }
  }, [basicOpen, profile, resetBasic]);

  React.useEffect(() => {
    if (pwOpen) {
      setPwError('');
      resetPw({ newPass: '', confirmPass: '' });
    }
  }, [pwOpen, resetPw]);

  React.useEffect(() => {
    if (verifyOpen) {
      setVerifyError('');
      setVerifyCode('');
    }
  }, [verifyOpen]);

  const onSaveBasic = async (data: BasicProfileValues) => {
    try {
      setBasicError('');
      await updateMe({
        fullName: data.fullName,
        phone: data.phone,
        birthday: data.birthday,
        gender: data.gender,
        city: data.city,
        address: data.address,
      }).unwrap();
      setBasicOpen(false);
      toast.success(t('profile.update_success'));
    } catch (err: unknown) {
      setBasicError(getApiErrorMessage(err, t('profile.update_failed')));
    }
  };

  const onSendVerificationCode = async () => {
    if (!profile?.email) return;
    try {
      setVerifyError('');
      await sendVerificationEmail({ email: profile.email }).unwrap();
      toast.success(t('profile.verify_send_success'));
    } catch (err: unknown) {
      setVerifyError(getApiErrorMessage(err, t('profile.verify_failed')));
    }
  };

  const onConfirmVerifyEmail = async () => {
    if (!profile?.email) return;
    const trimmed = verifyCode.trim();
    if (!/^\d{6}$/.test(trimmed)) {
      setVerifyError(t('profile.verify_code_invalid'));
      return;
    }
    try {
      setVerifyError('');
      await verifyEmail({ email: profile.email, code: trimmed }).unwrap();
      setVerifyOpen(false);
      toast.success(t('profile.verify_success'));
    } catch (err: unknown) {
      setVerifyError(getApiErrorMessage(err, t('profile.verify_failed')));
    }
  };

  const onSavePassword = async (data: ChangePasswordValues) => {
    try {
      setPwError('');
      await updateMe({ password: data.newPass }).unwrap();
      setPwOpen(false);
      toast.success(t('profile.password_updated'));
    } catch (err: unknown) {
      setPwError(getApiErrorMessage(err, t('profile.update_failed')));
    }
  };

  const genderLabel = (g?: string) => {
    if (g === 'MALE') return t('auth.male');
    if (g === 'FEMALE') return t('auth.female');
    if (g === 'OTHER') return t('auth.other');
    return g || '—';
  };

  if (isProfileLoading || isWalletLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
              {profile?.fullName?.charAt(0).toUpperCase() || <User className="h-7 w-7 text-primary-600" />}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-slate-900 dark:text-white">{profile?.fullName}</h1>
              <p className="text-xs font-medium text-slate-400">{profile?.roleName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
              <Coins className="h-4 w-4 shrink-0" />
              {wallet?.points ?? 0} {t('profile.points')}
            </span>
            <Button type="button" variant="secondary" size="sm" onClick={() => setBasicOpen(true)}>
              {t('profile.edit_basic')}
            </Button>
            <Button type="button" size="sm" onClick={() => setPwOpen(true)}>
              {t('profile.change_password')}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 p-4">
          <ProfileRow icon={Phone} label={t('auth.phone')} value={profile?.phone} />
          <ProfileRow icon={Calendar} label={t('auth.birthday')} value={toDateInput(profile?.birthday) || undefined} />
          <ProfileRow icon={User} label={t('auth.gender')} value={genderLabel(profile?.gender)} />
          <ProfileRow
            icon={Mail}
            label={t('auth.email')}
            value={profile?.email}
            trailing={
              profile?.emailVerified ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
                  {t('profile.email_verified')}
                </span>
              ) : (
                <Button type="button" variant="secondary" size="sm" className="shrink-0" onClick={() => setVerifyOpen(true)}>
                  {t('profile.verify_email')}
                </Button>
              )
            }
          />
          <ProfileRow icon={MapPin} label={t('auth.city')} value={profile?.city} />
          <ProfileRow icon={MapPin} label={t('auth.address')} value={profile?.address} />
        </div>
      </div>

      <Modal
        isOpen={basicOpen}
        onClose={() => setBasicOpen(false)}
        title={t('profile.edit_basic')}
        size="sm"
      >
        <form className="space-y-3" onSubmit={submitBasic(onSaveBasic)}>
          <Input label={t('auth.fullname')} register={regBasic('fullName')} error={basicErrors.fullName?.message} />
          <Input label={t('auth.phone')} register={regBasic('phone')} error={basicErrors.phone?.message} />
          <Input label={t('auth.birthday')} type="date" register={regBasic('birthday')} error={basicErrors.birthday?.message} />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('auth.gender')}</label>
            <select
              {...regBasic('gender')}
              className={`h-10 w-full rounded-lg border bg-white px-3 text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${
                basicErrors.gender ? 'border-red-500' : 'border-slate-200'
              }`}
            >
              <option value="MALE">{t('auth.male')}</option>
              <option value="FEMALE">{t('auth.female')}</option>
              <option value="OTHER">{t('auth.other')}</option>
            </select>
            {basicErrors.gender?.message && <p className="text-xs text-red-500">{basicErrors.gender.message}</p>}
          </div>
          <Input label={t('auth.city')} register={regBasic('city')} error={basicErrors.city?.message} />
          <Input label={t('auth.address')} register={regBasic('address')} error={basicErrors.address?.message} />
          {basicError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{basicError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setBasicOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              {t('profile.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={verifyOpen} onClose={() => setVerifyOpen(false)} title={t('profile.verify_modal_title')} size="sm">
        <div className="space-y-3">
          <p className="text-sm text-slate-600 dark:text-slate-400">{t('profile.verify_modal_hint')}</p>
          <Input
            label={t('profile.verify_code_label')}
            value={verifyCode}
            onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder={t('profile.verify_code_placeholder')}
            inputMode="numeric"
            autoComplete="one-time-code"
          />
          {verifyError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{verifyError}</p>}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setVerifyOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button type="button" variant="secondary" isLoading={isSendingCode} onClick={onSendVerificationCode}>
              {t('profile.verify_send_code')}
            </Button>
            <Button type="button" isLoading={isVerifyingEmail} onClick={onConfirmVerifyEmail}>
              {t('profile.verify_submit')}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={pwOpen} onClose={() => setPwOpen(false)} title={t('profile.change_password')} size="sm">
        <form className="space-y-3" onSubmit={submitPw(onSavePassword)}>
          <Input
            label={t('profile.new_password')}
            type="password"
            register={regPw('newPass')}
            error={pwErrors.newPass?.message}
          />
          <Input
            label={t('profile.confirm_password')}
            type="password"
            register={regPw('confirmPass')}
            error={pwErrors.confirmPass?.message}
          />
          {pwError && <p className="text-sm font-medium text-red-600 dark:text-red-400">{pwError}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setPwOpen(false)}>
              {t('profile.cancel')}
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              {t('profile.save')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const ProfileRow = ({
  icon: Icon,
  label,
  value,
  className = '',
  trailing,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  className?: string;
  trailing?: React.ReactNode;
}) => (
  <div className={`flex gap-3 rounded-lg bg-slate-50/80 px-3 py-2 dark:bg-slate-800/50 ${className}`}>
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
    <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
        <p className="break-words text-sm font-medium text-slate-800 dark:text-slate-200">{value?.trim() ? value : '—'}</p>
      </div>
      {trailing ? <div className="flex shrink-0 items-center">{trailing}</div> : null}
    </div>
  </div>
);

export default ProfileCustomerPage;
