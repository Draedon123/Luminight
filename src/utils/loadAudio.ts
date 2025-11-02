function loadAudio(element: HTMLAudioElement, src: string): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const callback = () => {
      resolve();
      element.removeEventListener("canplaythrough", callback);
    };

    element.addEventListener("canplaythrough", callback);
    element.onerror = reject;
    element.src = src;
  });
}

export { loadAudio };
