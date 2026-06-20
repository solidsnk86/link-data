export const share = async (link: string) => {
  await navigator.share({
    title: document.title,
    text: "Transmite tu cámara en vivo o comparte un archivo con un link. Todo corre directo entre navegadores — nada se queda guardado en un servidor intermedio.",
    url: link,
  });
};
