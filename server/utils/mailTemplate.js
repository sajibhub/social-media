export const OtpMail = (otp) => {
  return `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
      <h2 style="color: #f36b21; font-size: 24px; text-align: center; margin-bottom: 20px;">MATRIX OTP</h2>
      <p style="font-size: 16px;">Hello,</p>
      <p style="font-size: 16px;">Your OTP code is: <span style="font-size: 28px; font-weight: bold; color: #f36b21; background-color: #fff3e0; padding: 10px 20px; border-radius: 5px;">${otp}</span></p>
      <p style="font-size: 16px;">This code is valid for the next 5 minutes.</p>
      <p style="font-size: 14px; color: #777;">If you did not request this verification, please ignore this email.</p>
      <p style="font-size: 16px;">Thank you for choosing MATRIX!</p>
      <p style="font-size: 16px;">Best Regards,<br>Team MATRIX</p>
      <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #999; text-align: center;">Please do not reply to this email. This is an automated message.</p>
    </div>
  </div>`;
};

export const NewAccount = (name, email, phone, date) => {
  return `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
 <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
   <h2 style="color: #f36b21; font-size: 24px; text-align: center; margin-bottom: 20px;">Welcome to MATRIX!</h2>
   <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>
   <p style="font-size: 16px;">
     Your new account has been successfully created. We are excited to have you with us!
   </p>
   <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0;">
     <p style="font-size: 16px; margin: 5px 0;">
       <strong>Name:</strong> ${name}
     </p>
     <p style="font-size: 16px; margin: 5px 0;">
       <strong>Email:</strong> ${email}
     </p>
     <p style="font-size: 16px; margin: 5px 0;">
       <strong>Phone Number:</strong> ${phone}
     </p>
     <p style="font-size: 16px; margin: 5px 0;">
       <strong>Account Created:</strong> ${date}
     </p>
   </div>
   <p style="font-size: 16px;">
     You can now log in to your account and start using our services. If you have any questions, feel free to reach out to our support team.
   </p>
   <p style="font-size: 16px;">
     Best Regards,<br>Team MATRIX
   </p>
   <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">
   <p style="font-size: 12px; color: #999; text-align: center;">
     Please do not reply to this email. This is an automated message.
   </p>
 </div>
</div>
`;
};

export const PasswordResetSuccess = (name) => {
  return `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
  <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #4CAF50; font-size: 24px; text-align: center; margin-bottom: 20px;">Password Reset Successful</h2>
    
    <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>

    <p style="font-size: 16px;">We're letting you know that your password was successfully reset. If you made this change, you can disregard this email.</p>

    <p style="font-size: 16px; color: #555;">
      If you did not make this request, please secure your account immediately by resetting your password and reviewing your recent account activity.
    </p>
    
    <div style="text-align: center; margin: 20px 0;">
      <a href="${"https://matrix.sajib.xyz"}" style="font-size: 16px; color: white; background-color: #4CAF50; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
        Go to Your Account
      </a>
    </div>

    <p style="font-size: 16px;">Thank you for taking the steps to keep your account secure.</p>

    <p style="font-size: 16px;">Best Regards,<br>Team MATRIX</p>

    <hr style="border: 0; border-top: 1px solid #eaeaea; margin: 20px 0;">

    <p style="font-size: 12px; color: #999; text-align: center;">
      Please do not reply to this email. This is an automated message.
    </p>
  </div>
</div>
`;
};
