export default class Route extends HTMLElement {
    constructor(props) {
        super();
        this.props = props || {};
        this.rendered = false;
        // LOG: Ver cuándo se crea una instancia de Route
        console.log(`[Route] Constructor para path: ${this.props.path}`);
    }

    init() {
        if (!this.props.path) this.props.path = ' ';
        if (!this.props.component) {
            const routeInfo = slice.router.pathToRouteMap.get(this.props.path);
            this.props.component = routeInfo ? routeInfo.component : ' ';
        }
    }

    matchPath(pattern, currentPath) {
        const params = {};
        const patternParts = pattern.split('/').filter(p => p);
        const pathParts = currentPath.split('/').filter(p => p);

        if (patternParts.length !== pathParts.length) return null;

        for (let i = 0; i < patternParts.length; i++) {
            const patternPart = patternParts[i];
            const pathPart = pathParts[i];

            if (patternPart.startsWith('${') && patternPart.endsWith('}')) {
                const paramName = patternPart.slice(2, -1);
                params[paramName] = pathPart;
            } else if (patternPart !== pathPart) {
                return null;
            }
        }
        return { params };
    }

    async render() {
        const currentPath = window.location.pathname;
        console.log(`[Route ${this.props.path}] Render llamado. URL actual: ${currentPath}`);

        const match = this.matchPath(this.props.path, currentPath);

        if (!match) {
            console.log(`[Route ${this.props.path}] NO COINCIDE. Limpiando.`);
            this.removeComponent(currentPath);
            return;
        }

        console.log(`[Route ${this.props.path}] SÍ COINCIDE. Parámetros extraídos:`, match.params);
        
        const cacheKey = currentPath;
        console.log(`[Route ${this.props.path}] Usando clave de caché: ${cacheKey}`);

        const componentProps = {
            sliceId: this.props.component,
            params: match.params || {}
        };

        if (Route.componentCache[cacheKey]) {
            const cachedComponent = Route.componentCache[cacheKey];
            console.log(`[Route ${this.props.path}] Componente encontrado en caché. Reutilizando.`);
            this.innerHTML = '';
            this.appendChild(cachedComponent);
        } else {
            console.log(`[Route ${this.props.path}] Componente NO encontrado en caché. Construyendo uno nuevo.`);
            if (!this.props.component || !slice.controller.componentCategories.has(this.props.component)) {
                slice.logger.logError(`${this.sliceId}`, `Component ${this.props.component} not found`);
                return;
            }
            
            const component = await slice.build(this.props.component, componentProps);
            
            if (component) {
                console.log(`[Route ${this.props.path}] Componente construido con éxito.`);
                this.innerHTML = '';
                this.appendChild(component);
                Route.componentCache[cacheKey] = component;
            }
        }
        this.rendered = true;
    }

    async renderIfCurrentRoute() {
        const match = this.matchPath(this.props.path, window.location.pathname);
        if (match) {
            if (!this.rendered) {
                await this.render();
            }
            return true;
        }
        return false;
    }

    removeComponent(path) {
        console.log(`[Route ${this.props.path}] removeComponent llamado. Clave a borrar: ${path}`);
        delete Route.componentCache[path];
        this.innerHTML = '';
        this.rendered = false;
    }
}

Route.componentCache = {};

customElements.define('slice-route', Route);