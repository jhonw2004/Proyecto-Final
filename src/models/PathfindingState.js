import AStar from "./algorithms/AStar";
import BFS from "./algorithms/BFS";
import DFS from "./algorithms/DFS";
import PathfindingAlgorithm from "./algorithms/PathfindingAlgorithm";

export default class PathfindingState {
    static #instancia;

    /**
     * Clase Singleton
     * @returns {PathfindingState}
     */
    constructor() {
        if (!PathfindingState.#instancia) {
            this.nodoFin = null;
            this.grafo = null;
            this.finished = false;
            this.algoritmo = new PathfindingAlgorithm();
            this.centroCirculo = null;
            this.radioKm = null;
            PathfindingState.#instancia = this;
        }
    
        return PathfindingState.#instancia;
    }

    get nodoInicio() {
        return this.grafo.nodoInicio;
    }

    /**
     * 
     * @param {Number} id ID del nodo OSM
     * @returns {import("./Node").default} nodo
     */
    obtenerNodo(id) {
        return this.grafo?.obtenerNodo(id);
    }

    /**
     * Verifica si un nodo está dentro del círculo del área de búsqueda
     * @param {import("./Node").default} nodo 
     * @returns {Boolean}
     */
    nodoEnArea(nodo) {
        if (!this.centroCirculo || !this.radioKm) return true;
        
        const lat1 = this.centroCirculo.lat * Math.PI / 180;
        const lat2 = nodo.latitud * Math.PI / 180;
        const deltaLat = (nodo.latitud - this.centroCirculo.lat) * Math.PI / 180;
        const deltaLon = (nodo.longitud - this.centroCirculo.lon) * Math.PI / 180;

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                  Math.cos(lat1) * Math.cos(lat2) *
                  Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanciaKm = 6371 * c;

        return distanciaKm <= this.radioKm;
    }

    /**
     * Resetea al estado por defecto
     */
    reset() {
        this.finished = false;
        if(!this.grafo) return;
        for(const clave of this.grafo.nodos.keys()) {
            this.grafo.nodos.get(clave).reset();
        }
    }

    /**
     * Resetea el estado e inicializa nueva animación de pathfinding
     */
    start(algoritmo) {
        this.reset();
        switch(algoritmo) {
            case "astar":
                this.algoritmo = new AStar();
                break;
            case "bfs":
                this.algoritmo = new BFS();
                break;
            case "dfs":
                this.algoritmo = new DFS();
                break;
            default:
                this.algoritmo = new AStar();
                break;
        }

        this.algoritmo.start(this.nodoInicio, this.nodoFin);
    }

    /**
     * Progresa el algoritmo de pathfinding por un paso/iteración
     * @returns {(import("./Node").default)[]} array de nodos que fueron actualizados
     */
    nextStep() {
        const nodosActualizados = this.algoritmo.nextStep();
        if(this.algoritmo.finished || nodosActualizados.length === 0) {
            this.finished = true;
        }

        return nodosActualizados;
    }
}