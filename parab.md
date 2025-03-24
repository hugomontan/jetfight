# Implementação Matemática de Animação/Movimento Parabólico

## 3.8.1 Parâmetros de Entrada

### Coordenadas do Sistema:
- **Posição inicial (xᵢ, yᵢ):** `(0, altura_da_tela)`  
  *(Canto inferior esquerdo da tela)*
- **Posição final (x_f, y_f):** `(largura_da_tela, altura_da_tela)`  
  *(Canto inferior direito da tela)*
- **Duração total (T):** `3 segundos`
- **Elemento gráfico:** `star.png` (imagem PNG)

### Observações sobre o Sistema de Coordenadas:
1. **Orientação do Eixo Y:**  
   - No Phaser, o eixo Y cresce para **baixo** (diferente do sistema cartesiano tradicional).
   - Para criar uma parábola "para cima", o cálculo da posição Y deve subtrair valores da altura da tela.

2. **Fórmulas de Movimento:**
   ```javascript
   // Movimento Uniforme (MU) no eixo X
   vx = (x_f - xᵢ) / T  // Velocidade horizontal constante
   x(t) = xᵢ + vx * t

   // Movimento Uniformemente Variado (MUV) no eixo Y
   ay = 2 * (y_f - yᵢ) / T²  // Aceleração vertical
   y(t) = yᵢ + 0.5 * ay * t²
