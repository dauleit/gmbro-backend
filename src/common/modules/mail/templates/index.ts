import { ConfigService } from 'src/configs/config.service';

const configService = new ConfigService();

export const EmailVerificationTemplate = (verificationToken: string) => {
  return `Hi! <br><br> Thank you for registering.<br><br>
    <a href=${configService.get('WEB_APP_URL')}}/verify/${verificationToken}>
    Click here to activate your account</a>
    </br>Regards,</br>Orange Cleaning Team`;
};

export const EmailVerifiedTemplate = () => {
  return `Hi! <br><br> Thanks for your verifying your email.<br><br>
    <p>Please continue using the services form Orange Cleaning.</p>
    <a href="${configService.get('WEB_APP_URL')}}/signIn">Click here to Login</a>
    <br>Regards,<br>Orange Cleaning Team`;
};

export const ForgotPasswordTemplate = (newPasswordToken: string) => {
  return `Hi! <br><br> If you requested to reset your password<br><br>
  <p>Here is the link to reset your password. Please click the link below to continue.</p><br>
  <a href=${configService.get('WEB_APP_URL')}/reset-password/${newPasswordToken}>Click here</a>
  <br>Regards,</br>Orange Cleaning Team`;
};

export const PasswordResetTemplate = () => {
  return `Hi! <br><br> You've successfully reset your password.<br><br>
  <p>Please click the link below to continue.</p><br>
  <a href="${configService.get('WEB_APP_URL')}/signIn">Click here</a>
  <br>Regards,</br>Orange Cleaning Team`;
};
