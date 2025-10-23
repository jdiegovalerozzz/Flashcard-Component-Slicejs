const routes = [
   { path: '/', component: 'HomePage' },
   { path: '/404', component: 'NotFound' },
   { path: '/settings', component: 'SettingsPage' },
   {
      path: "/create-flashcard",
      component: "FlashcardCreator",
   },
   {
      path: "/deck/${id}",
      component: "DeckViewPage",
   },
   {
      path: '/edit-flashcard/${id}',
      component: 'FlashcardCreator'
   },
   { 
      path: '/edit-deck/${id}', component: 'DeckEditor'
   },
   { 
      path: '/practice/${deckId}', component: 'PracticeSession'
   }
];

export default routes;