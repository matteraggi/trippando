Trippando - Project Specifications

## Project Overview
Trippando is a mobile-first Progressive Web App (PWA) designed for tracking travel expenses and managing notes during a trip. The primary goal is to provide a Native iOS Feel without being a native app. The app must allow the user to record expenses (maybe with currency conversion, if API exists), track who paid, and access critical travel notes.

## Tech Stack
Runtime/Language: Node.js, TypeScript.

Frontend Framework: React (Vite).

UI Framework: Tailwind CSS.

Icons: lucide-react.

PWA Engine: vite-plugin-pwa.

Backend (BaaS): Firebase (Firestore, Auth, Hosting).

State/Data: Firebase SDK (Firestore) (maybe if doable, with Offline Persistence enabled).

## Core Architecture & Offline Strategy
### PWA Configuration
Manifest: Must be configured for standalone mode.

iOS Meta: Include viewport-fit=cover and apple-mobile-web-app-status-bar-style (black-translucent).

Assets: Service Worker must cache all static assets (HTML, CSS, JS, Fonts) immediately.

### Data Persistence (Offline First)
Firestore: Enable enableIndexedDbPersistence() in the initialization logic.

Behavior: The app must allow reading/writing to collections while offline. Synchronization happens automatically when connectivity is restored.

Error Handling: UI should not block user actions if the network is down.

## Database Schema (Firestore)
NoSQL Structure. Collections are root-level.

Collection: users
uid (string): Firebase Auth UID.

displayName (string): User's name.

email (string).

Collection: trips
id (string): Auto-generated.

name (string): The name of the trip.

coverImage (string): URL to the trip's cover image.

startDate (timestamp): The start date of the trip.

endDate (timestamp): The end date of the trip.

createdAt (serverTimestamp).

updatedAt (serverTimestamp).

members (array of strings): Array of user UIDs.

Collection: expenses
id (string): Auto-generated.

amount (number): The value of the expense.

currency (string): 'THB', 'EUR', 'GBP', 'USD',...

category (string): Enum/String (e.g., 'Food', 'Transport', 'Hotel', 'Activity').

description (string): Short text.

paidBy (string): uid of the user who paid.

date (timestamp): Date of purchase.

tripId (string): The ID of the trip.

createdAt (serverTimestamp).

Collection: notes
id (string): Auto-generated.

title (string).

content (string): Markdown text.

isPinned (boolean): If true, shows at the top.

createdAt (serverTimestamp).

updatedAt (timestamp).

tags (array of strings): Optional.

tripId (string): The ID of the trip.