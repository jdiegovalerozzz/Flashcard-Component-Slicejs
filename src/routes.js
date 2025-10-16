const routes = [
   // Rutas principales
   { path: '/', component: 'HomePage' },
   { path: '/404', component: 'NotFound' },
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
   }


];

export default routes;