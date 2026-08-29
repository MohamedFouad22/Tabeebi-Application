export const generateOtp = async () => {
  return Math.floor(Math.random() * (800000 - 100000) + 90000);
};
