export default class Route extends HTMLElement {
// ... (constructor, init, getters/setters se mantienen igual)
   constructor(props) {
      super();
      this.props = props;
      this.rendered = false;
   }

   init() {
      if (!this.props.path) {
         this.props.path = ' ';
      }

      if (!this.props.component) {
         this.props.component = slice.router.pathToRouteMap.get(this.props.path).component || ' ';
      }
   }

   get path() {
      return this.props.path;
   }

   set path(value) {
      this.props.path = value;
   }

   get component() {
      return this.props.component;
   }

   set component(value) {
      this.props.component = value;
   }


   async render() {
      // --- INICIO DE LA MODIFICACIÓN ---

      // 1. Obtenemos la ruta actual y sus parámetros del router principal
      const currentRoute = slice.router.match(window.location.pathname);
      const params = currentRoute ? currentRoute.params : {};

      // 2. Preparamos las props que se pasarán al componente
      const componentProps = {
         sliceId: this.props.component,
         params: params // Inyectamos los parámetros de la URL
      };

      // --- FIN DE LA MODIFICACIÓN ---

      if (Route.componentCache[this.props.component]) {
         const cachedComponent = Route.componentCache[this.props.component];
         this.innerHTML = '';

         // Actualizamos las props del componente cacheado
         slice.controller.setComponentProps(cachedComponent, componentProps);

         if (cachedComponent.update) {
            await cachedComponent.update();
         }

         this.appendChild(cachedComponent);
      } else {
         if (!this.props.component) {
            return;
         }

         if (!slice.controller.componentCategories.has(this.props.component)) {
            slice.logger.logError(`${this.sliceId}`, `Component ${this.props.component} not found`);
            return;
         }

         // 3. Pasamos las props completas al construir el componente
         const component = await slice.build(this.props.component, componentProps);

         this.innerHTML = '';
         this.appendChild(component);
         Route.componentCache[this.props.component] = component;
      }
      this.rendered = true;
   }

   async renderIfCurrentRoute() {
// ... (el resto del archivo se mantiene igual)
      if (this.props.path === window.location.pathname) {
         if (this.rendered) {
            if (Route.componentCache[this.props.component]) {
               const cachedComponent = Route.componentCache[this.props.component];
               if (cachedComponent.update) {
                  await cachedComponent.update();
               }
               return true;
            }
         }
         await this.render();
         return true;
      }
      return false;
   }

   removeComponent() {
      delete Route.componentCache[this.props.component];
      this.innerHTML = '';
      this.rendered = false;
   }
}

Route.componentCache = {};

customElements.define('slice-route', Route);