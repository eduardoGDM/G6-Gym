export const isNotInFuture = (value) => {
  if (!value) return true;
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date <= today;
};
