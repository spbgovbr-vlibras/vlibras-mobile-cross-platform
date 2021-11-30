const dateFormat = (date: string) => {
  const meses = [
    'janeiro',
    'fevereiro',
    'março',
    'abril',
    'maio',
    'junho',
    'julho',
    'agosto',
    'setembro',
    'outubro',
    'novembro',
    'dezembro',
  ];

  const localeDate = new Date().toLocaleDateString('pt-BR');
  const newDate = new Date();
  const dateFormatted = new Date(date.split('/').reverse().join('/'));

  let daysDifference = newDate.getTime() - dateFormatted.getTime();
  daysDifference = Math.trunc(daysDifference / (1000 * 60 * 60 * 24));

  if (localeDate === date) {
    return 'Hoje';
  }
  if (daysDifference <= 7 && newDate.getDay() > dateFormatted.getDay()) {
    return 'Essa semana';
  }
  if (
    dateFormatted.getMonth() === newDate.getMonth() &&
    dateFormatted.getFullYear() === newDate.getFullYear()
  ) {
    return 'Esse mês';
  }
  return `${dateFormatted.getDate()} ${
    meses[dateFormatted.getMonth()]
  } ${dateFormatted.getFullYear()}`;
};

export default dateFormat;
