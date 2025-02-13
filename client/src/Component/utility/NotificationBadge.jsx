const NotificationBadge = ({ count }) => {
  return (
    count > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border border-white shadow-sm">
        {count > 99 ? "99+" : count}
      </span>
    )
  );
};

export default NotificationBadge;