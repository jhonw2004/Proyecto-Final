class PathfindingAlgorithm {
    constructor() {
        this.finished = false;
        this.nodosExplorados = 0;
        this.tiempoInicio = 0;
        this.tiempoFin = 0;
    }

    /**
     * Resetea el estado interno e inicializa nuevo pathfinding
     * @param {(import("./Node").default)} nodoInicio 
     * @param {(import("./Node").default)} nodoFin 
     */
    start(nodoInicio, nodoFin) {
        this.finished = false;
        this.nodoInicio = nodoInicio;
        this.nodoFin = nodoFin;
        this.nodosExplorados = 0;
        this.tiempoInicio = performance.now();
    }

    /**
     * Progresa el algoritmo de pathfinding por un paso/iteración
     * @returns {(import("./Node").default)[]} array de nodos que fueron actualizados
     */
    nextStep() {
        return [];
    }

    /**
     * Obtiene las métricas del algoritmo
     * @returns {Object} métricas del algoritmo
     */
    obtenerMetricas() {
        return {
            nodosExplorados: this.nodosExplorados,
            tiempoEjecucion: this.tiempoFin - this.tiempoInicio
        };
    }
}

export default PathfindingAlgorithm;