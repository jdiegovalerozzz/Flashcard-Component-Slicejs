/**
 * SRSService encapsula la lógica del algoritmo de Repetición Espaciada (Spaced Repetition System).
 * Este servicio no tiene estado; simplemente proporciona una función de cálculo estática.
 */
export default class SRSService {
    /**
     * Calcula el próximo estado de una tarjeta basado en la calidad de la respuesta.
     * Utiliza una versión simplificada del algoritmo SM-2.
     * @param {object} card - La tarjeta a actualizar. Debe tener 'interval', 'easeFactor'.
     * @param {number} quality - La calidad de la respuesta (ej: 0: 'Again', 3: 'Hard', 5: 'Good').
     * @returns {object} La tarjeta con el nuevo interval, easeFactor y nextReviewDate.
     */
    static calculateNextReview(card, quality) {
        const now = new Date();
        let nextReviewDate;

        // Si la respuesta es incorrecta (calidad < 3), se reinicia el aprendizaje.
        if (quality < 3) {
            card.interval = 0; // Se reinicia el intervalo de días.
            // Programamos la revisión para dentro de 10 segundos para facilitar las pruebas.
            nextReviewDate = new Date(now.getTime() + 10 * 1000); // 10 segundos
        } else {
            // Si es la primera vez que se acierta (intervalo 0), el próximo intervalo es 1 día.
            if (card.interval === 0) {
                card.interval = 1;
            } 
            // Si es la segunda vez (intervalo 1), el próximo es de 6 días.
            else if (card.interval === 1) {
                card.interval = 6;
            } 
            // Para las siguientes veces, se multiplica por el factor de facilidad.
            else {
                card.interval = Math.ceil(card.interval * card.easeFactor);
            }
            // Calculamos la fecha sumando los días del intervalo.
            nextReviewDate = new Date(new Date().setDate(now.getDate() + card.interval));
        }

        card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        
        // El factor de facilidad no debe ser menor que 1.3.
        if (card.easeFactor < 1.3) {
            card.easeFactor = 1.3;
        }

        card.nextReviewDate = nextReviewDate.toISOString();

        console.log(`Card updated. New interval: ${card.interval} days, New Ease: ${card.easeFactor.toFixed(2)}, Next Review: ${card.nextReviewDate}`);

        return card;
    }
}