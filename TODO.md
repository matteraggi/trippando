# TODO

- [x] tasto aggiungi note nelle note
- [x] modifica del nickname in profilo
- [x] grafico spese per categoria
- [x] spostare sezione profilo o mettere sulla stessa riga

## 🏗️ Phase 1: Architecture & Navigation
- [x] **Homepage Redesign**: Create a split view for "My Trips" (Viaggi) and "My Restaurants" (Ristoranti).
- [x] **Navigation**: Update bottom navigation or main menu to support new sections.

## 🍽️ Phase 2: Restaurants (Food Log)
- [ ] **Database**: Create `restaurants` and `visits` collections in Firebase.
- [ ] **Places List**: View all restaurants visited, sorted by rating/date.
- [ ] **Add Restaurant**: Form to add a new place (Name, Type, Location/Google Maps Link).
- [ ] **Add Visit Log**: Form to log a visit (Date, Dishes list with ratings, Price, Friends tagged).
- [ ] **Restaurant Details**: View stats for a specific place (Average rating, Times visited, Visit history).

## ✈️ Phase 3: Trip Planning (Itinerary)
- [ ] **Database**: Add `itinerary` sub-collection or field to Trips.
- [ ] **Itinerary UI**: Day-by-day timeline view in Trip Details.
- [ ] **Add Event**: Form to add activities (Time, Title, Location, Notes) to a day.
- [ ] **Documents**: Upload/Link feature for tickets (PDF/Images) linked to events.
- [ ] **Map View**: Visualize trip stops on a map.

## 🔗 Phase 4: Trip Integration
- [ ] **Trip Restaurants**: Tab in Trip Details showing restaurants visited *during* that trip.
- [ ] **Wishlist**: Feature to add "Places to try" to a trip before visiting.
- [ ] **Expense Link**: Auto-create an expense when logging a restaurant visit during a trip.