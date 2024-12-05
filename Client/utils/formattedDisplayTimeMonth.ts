const formattedDisplayTimeMonth = (timeString: string): string => {
  const date = new Date(timeString);
  // Specify the locale as 'en-US' for United States date format
  // and set options to display a full month name, and numeric day and year
  const options: Intl.DateTimeFormatOptions = {
    month: 'long', // 'long' for the full month name
    day: 'numeric', // 'numeric' for the day of the month
    year: 'numeric', // 'numeric' for the year
  };

  const formattedDate = date.toLocaleDateString('en-US', options);
  return formattedDate;
};

export default formattedDisplayTimeMonth;
