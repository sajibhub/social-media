const postTime = (createdAt) => {
    const now = new Date();
    const diffInMs = now - new Date(createdAt);
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    return diffInMinutes < 1440
      ? diffInMinutes < 60
        ? `${diffInMinutes} minutes ago`
        : `${Math.floor(diffInMinutes / 60)} hours ago`
      : new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric', timeZone: 'Asia/Dhaka'
      }).format(new Date(createdAt));
  };

  export default postTime