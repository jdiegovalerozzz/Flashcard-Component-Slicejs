const routes = [
   // Rutas principales
   { path: '/', component: 'HomePage' },
   { path: '/404', component: 'NotFound' },
   { path: '/settings', component: 'SettingsPage' },
   {
      path: '/Docum/${category}/${id}',
      component: 'LandingPage',
   },
   {
      path: "/Playground",
      component: "Playground",
   },
   {
      path: "/create-flashcard",
      component: "FlashcardCreator",
   },
   {
      // CAMBIO CLAVE: Usamos la sintaxis ${id} en lugar de :id
      path: "/deck/${id}",
      component: "DeckViewPage",
   }
];

export default routes;