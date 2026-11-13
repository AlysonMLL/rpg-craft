/**
 * Função do Arquivo: Tipos compartilhados entre as camadas de dados.
 * O que há aqui: ImageCrop (parte da imagem que aparece, em % da imagem original, com a origem
 * no canto superior esquerdo). Vale para retratos, miniaturas e banners.
 */
export interface ImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}