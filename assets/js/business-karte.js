(function () {
  "use strict";

  // MK Black Card - Kundenkarte. Der Kunde kommt ueber seinen persoenlichen Link
  // (?k=...). Eine Frage, zwei Wege: Essen fuers Buero oder Feier planen.
  // Alles landet wie bisher per karte_reaktion im Vertrieb und per Mail.

  var TEL_WA = "491772019889";
  var MINDEST = 25;              // Mittagstisch: Mindestbestellwert in Euro
  var BUFFET = 27.5, BUFFET_NORMAL = 31.9;
  var LIEFER_GRENZE = 20, LIEFER_GEBUEHR = 25;   // Feiern: Lieferung ab 20 Gaesten inklusive, darunter 25 EUR
  function lieferGebuehr() { return S.f.personen && S.f.personen < LIEFER_GRENZE ? LIEFER_GEBUEHR : 0; }
  function lieferText() { return lieferGebuehr() ? euro(LIEFER_GEBUEHR) + " (unter " + LIEFER_GRENZE + " Gästen)" : "inklusive"; }
  var SUESS = 3.9;               // Team-Paket: Suesses pro Person
  var ZEITEN = ["11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00"];

  // Speisekarte von Supreme Pizza (Henstedter Str. 4) + indische Gerichte von Mahboobs Kitchen.
  // Normalpreis = Shop-Preis, Black Card: unter 5 € gleich, 5-9,99 € -0,50, 10-19,99 € -1,00, ab 20 € -8 %.
  var KATS = [["pizza", "Pizza"], ["calzone", "Calzone"], ["pasta", "Pasta"], ["burger", "Burger & Schnitzel"], ["wraps", "Wraps & Salate"], ["indisch", "Indisch"], ["sushi", "Sushi"], ["bowls", "Bowls"], ["snacks", "Snacks"], ["dips", "Dips"], ["dessert", "Desserts"], ["getraenke", "Getränke"]];
  var GERICHTE = [
    ["pizza", "", "Pizza Margherita", 9.4, 9.9, "margherita", "Ø 26 cm · mit Tomatensoße und Käse"],
    ["pizza", "", "Pizza Salami", 9.9, 10.9, "salami", "Ø 26 cm · mit Salami"],
    ["pizza", "", "Pizza Schinken", 9.9, 10.9, "sp-kat1", "Ø 26 cm · mit Schinken"],
    ["pizza", "", "Pizza Funghi", 9.9, 10.9, "funghi", "Ø 26 cm · mit frischen Champignons"],
    ["pizza", "", "Pizza Hawaii", 9.9, 10.9, "sp-kat1", "Ø 26 cm · mit Schinken und Ananas"],
    ["pizza", "", "Pizza Vier Jahreszeiten", 9.9, 10.9, "sp-kat1", "Ø 26 cm · mit Schinken, Salami, frischen Champignons und Artischocken"],
    ["pizza", "", "Pizza Tonno", 10.3, 11.3, "sp-kat1", "Ø 26 cm · mit Thunfisch und roten Zwiebeln"],
    ["pizza", "", "Pizza Bauern", 11.9, 12.9, "sp-kat1", "Ø 26 cm · mit Schinken, roten Zwiebeln, milden Peperoni und Sauce Hollandaise"],
    ["pizza", "", "Pizza Hack", 10.9, 11.9, "sp-kat1", "Ø 26 cm · mit Rinderhack, Mais, Peperoni und roten Zwiebeln"],
    ["pizza", "", "Pizza Mista", 10.9, 11.9, "salami", "Ø 26 cm · mit Schinken, Salami, Champignons, Peperoni und grünen Oliven"],
    ["pizza", "", "Pizza Kebab", 10.9, 11.9, "sp-kat1", "Ø 26 cm · mit Dönerfleisch, roten Zwiebeln und Paprikamix"],
    ["pizza", "", "Pizza Cheeseburger", 10.9, 11.9, "sp-kat1", "Ø 26 cm · mit Rinderhack, frischen Tomaten, Gewürzgurken, roten Zwiebeln und Chili Cheese Sauce"],
    ["pizza", "", "Pizza Sucuk", 10.9, 11.9, "sp-kat1", "Ø 26 cm · mit Sucuk, roten Zwiebeln, grünen Oliven und Hirtenkäse"],
    ["pizza", "", "Pizza Mafioso", 10.9, 11.9, "salami", "Ø 26 cm · mit Salami, Thunfisch, Jalapeños und Knoblauch"],
    ["pizza", "", "Pizza BBQ Chicken", 10.9, 11.9, "teriyaki", "Ø 26 cm · mit Hähnchenbrustfilet, Kirschtomaten, roten Zwiebeln und BBQ Sauce"],
    ["pizza", "", "Pizza Green Garden", 11.9, 12.9, "veggi", "Ø 26 cm · mit Zwiebeln, Mais, Paprikamix, Brokkoli und grünen Oliven"],
    ["pizza", "", "Pizza Holland", 12.9, 13.9, "sp-kat1", "Ø 26 cm · mit Hinterschinken, Tomatenscheiben, Brokkoli und Hollandaisesauce"],
    ["pizza", "", "Pizza Tandoori Chicken", 11.9, 12.9, "teriyaki", "Ø 26 cm · mit Tandoori-Hähnchen, roten Zwiebeln, grünen Oliven, Paprikamix und Mais"],
    ["pizza", "", "Pizza Chicken Supreme", 11.4, 12.4, "sp-kat1", "Ø 26 cm · mit Hähnchenbrustfilet, Blattspinat, Knoblauch und Creme fraiche"],
    ["pizza", "", "Pizza Chicken Curry", 10.9, 11.9, "sp-kat1", "Ø 26 cm · mit Hähnchenbrustfilet und Ananas"],
    ["pizza", "", "Pizza Bostan", 12.9, 13.9, "sp-kat1", "Ø 26 cm · mit Hollandaisesauce, Zwiebeln, Brokkoli, Crispy Chicken und Steakpfeffer"],
    ["pizza", "", "Pizza Master Cheese", 11.9, 12.9, "sp-kat1", "Ø 26 cm · mit Hirtenkäse, Cheddar, Gouda und Mozzarella"],
    ["pizza", "", "Pizza Texas BBQ", 11.9, 12.9, "sp-kat1", "Ø 26 cm · mit Rinderhack, BBQ Sauce, roten Zwiebeln und Cherrytomaten"],
    ["pizza", "", "Pizza Surf & Turf Delux", 12.9, 13.9, "sp-kat1", "Ø 26 cm · mit Rindersteakstreifen, Scampi, Cherrytomaten und Hollandaise"],
    ["pizza", "", "Pizza Chef Special", 11.9, 12.9, "sp-kat1", "Ø 26 cm · mit Rindersteakstreifen, Brokkoli, Kirschtomaten und Hollandaise Sauce"],
    ["pizza", "", "Pizza Barbecue Spezial", 13.9, 14.9, "sp-kat1", "Ø 26 cm · BBQ-Sauce, Hähnchenbrustfilet, Salami, Rinderhack, Rinder-Bacon und Mozzarella."],
    ["pizza", "", "Pizza Hot & Spicy", 11.9, 12.9, "sp-kat1", "Ø 26 cm · mit Schinken, Rinderhack, Jalapeños und Sauce Hollandaise"],
    ["calzone", "", "Calzone Gemischt", 11.9, 12.9, "sp-kat27", "mit Salami, Schinken und frischen Champignons"],
    ["calzone", "", "Calzone mit Salami", 10.9, 11.9, "sp-kat27", "mit Salami"],
    ["calzone", "", "Calzone mit Schinken", 10.9, 11.9, "sp-kat27", "mit Schinken"],
    ["calzone", "", "Calzone mit Rinderhack", 10.5, 11.5, "sp-kat27", "mit Rinderhack, Peperoni und Mais"],
    ["calzone", "", "Calzone mit Thunfisch", 12.9, 13.9, "sp-kat27", "mit Thunfisch und Zwiebeln"],
    ["calzone", "", "Calzone mit Döner", 12.9, 13.9, "sp-kat27", "mit Dönerfleisch, Zwiebeln und Paprika"],
    ["calzone", "", "Calzone Veggi", 11.9, 12.9, "sp-kat27", "Gemüse nach Wahl"],
    ["pasta", "", "Pasta Bolognese", 8.4, 8.9, "sp-kat2", "mit Tomatensoße und Rinderhackfleisch"],
    ["pasta", "", "Pasta Milano", 9.4, 9.9, "sp-kat2", "mit Käse-Sahnesauce, mariniertem Rindersteakstreifen, Kirschtomaten und Brokkoli"],
    ["pasta", "", "Pasta Venezia", 9.4, 9.9, "sp-kat2", "mit Käse-Sahnesauce, Putenschinken und Champignons"],
    ["pasta", "", "Pasta Roma", 8.4, 8.9, "sp-kat2", "mit Sahnesauce, Basilikumpesto, Rucola, Kirschtomaten und Grana Padang (ital. Hartkäse)"],
    ["pasta", "", "Pasta Supreme", 9.9, 10.9, "sp-kat2", "mit gebratenen Nudeln, Hähnchenbrustfilet, Zwiebeln, Paprika mix, Brokkoli, Knoblauch in Tomaten, Sahnesauce mit gewürzten"],
    ["burger", "Burger", "Crispy Chicken Cheese Burger", 7.4, 7.9, "sp-kat28", "mit Salat, 135gr Crispy Chicken, Tomatenscheiben, Mayonnaise und Chester-Schmelzkäse"],
    ["burger", "Burger", "Hot Crispy Chicken Burger", 7.4, 7.9, "sp-kat28", "mit Salat, 135gr Crispy Chicken, Tomatenscheiben, Jalapenos und Chili-Cheesesauce"],
    ["burger", "Burger", "Cheese Burger", 7.4, 7.9, "sp-kat28", "mit Tomatenscheiben, roten Zwiebeln, dänische Gurken, Ketchup, Mayonnaise und Chester-Schmelzkäse"],
    ["burger", "Burger", "Chili Cheeseburger", 7.4, 7.9, "sp-kat28", "mit Tomatenscheiben, roten Zwiebeln, scharfe Jalapenos und Chili-Cheesesauce"],
    ["burger", "Burger", "Steakhouse Cheeseburger", 8.4, 8.9, "sp-kat28", "mit Bacon, Tomatenscheiben, Röstzwiebeln, BBQ-Sauce, Mayonnaise und geschmolzenem Käse"],
    ["burger", "Schnitzel · mit Pommes und Salat", "Schnitzel Wiener Art", 9.0, 10.0, "sp-kat6", "mit Pommes, Salat und Zitronen"],
    ["burger", "Schnitzel · mit Pommes und Salat", "Jäger Schnitzel", 9.5, 10.5, "sp-kat6", "mit Pommes, Salat und Jägersauce"],
    ["burger", "Schnitzel · mit Pommes und Salat", "Brokkoli Schnitzel", 10.0, 11.0, "sp-kat6", "mit Pommes, Salat und Brokkoli in Hollandaisesauce"],
    ["wraps", "Wraps", "Veggi Wrap", 6.4, 6.9, "sp-kat3", "mit Mozzarella, Kirschtomaten, grüne Oliven, Rucola und Basilikum-Pesto"],
    ["wraps", "Wraps", "Chicken Wrap", 6.4, 6.9, "sp-kat3", "mit Crispy Chicken und Chester-Schmelzkäse"],
    ["wraps", "Wraps", "Tuna Wrap", 6.4, 6.9, "sp-kat3", "mit Thunfisch, roten Zwiebeln und Hirtenkäse"],
    ["wraps", "Wraps", "Döner Wrap", 7.0, 7.5, "sp-kat3", "mit Dönerfleisch, Zwiebeln, Chester-Schmelzkäse und Tzatziki"],
    ["wraps", "Salat Bowls", "Garten Salat Bowl", 7.0, 7.5, "sp-kat7", "mit roten Zwiebeln, Paprikamix und grünen Oliven"],
    ["wraps", "Salat Bowls", "Thunfisch Salat Bowl", 8.4, 8.9, "sp-kat7", "mit Hirtenkäse, Thunfisch, roten Zwiebeln und gekochtem Ei"],
    ["wraps", "Salat Bowls", "Chicken Salat Bowl", 7.9, 8.4, "sp-kat7", "mit italienischem Hartkäse, Crispy Chicken und Croutons"],
    ["wraps", "Salat Bowls", "Chef Salat Bowl", 8.4, 8.9, "sp-kat7", "mit Ei, Hinterschinken und Gouda"],
    ["indisch", "", "Butter Chicken", 13.5, 14.9, "butterchicken", "Mit Basmati-Reis · mild und cremig"],
    ["indisch", "", "Chicken Tikka Masala", 13.5, 14.9, "tikka", "Mit Basmati-Reis · würzig"],
    ["indisch", "", "Chicken Korma", 13.5, 14.9, "korma", "Mit Basmati-Reis · mild, mit Nüssen"],
    ["indisch", "", "Chicken Biryani", 13.9, 15.5, "biryani", "Gewürzreis mit Hähnchen und Raita"],
    ["indisch", "", "Lamb Rogan Josh", 15.5, 17.5, "rogan", "Mit Basmati-Reis · Lamm-Curry"],
    ["indisch", "", "Palak Paneer", 12.9, 14.5, "paneer", "Mit Basmati-Reis · vegetarisch"],
    ["indisch", "", "Chana Masala", 11.5, 12.9, "chana", "Mit Basmati-Reis · vegan"],
    ["indisch", "", "Dal Tadka", 11.5, 12.9, "dal", "Gelbe Linsen, mit Basmati-Reis · vegetarisch"],
    ["indisch", "", "Samosa", 5.5, 5.9, "samosa", "2 Stück, mit Minz-Chutney · vegetarisch"],
    ["sushi", "Sushi-Menüs", "California Menü (24 Stück)", 25.6, 27.9, "sp-kat13", "8x Surimi mit Sesam, 8x Sake Roll mit Schnittlauch, 8x Tekka Roll mit Tobiko"],
    ["sushi", "Sushi-Menüs", "Crispy Menü (24 Stück)", 28.4, 30.9, "sp-kat13", "8x Crispy Chicken, 8x Crispy Sake, 8x Crispy Veggie"],
    ["sushi", "Sushi-Menüs", "Mix Menü (30 Stück)", 25.6, 27.9, "sp-kat13", "6x Sake Spring Roll, 8x Maki Kappa, 8x Maki Sake Avocado, 8x Surimi Roll mit Sesam"],
    ["sushi", "Sushi-Menüs", "Nigiri Menü (10 Stück)", 23.4, 25.5, "sp-kat13", "2x Nigiri, 2x Nigiri Tekka, 2x Nigiri Sake Teriyaki, 2x Nigiri Tekka Teriyaki, 2x Nigiri Avocado"],
    ["sushi", "Sushi-Menüs", "Veggiemenü (24 Stück)", 22.5, 24.5, "sp-kat13", "8x Maki Kappa, 6x Veggie Spring Roll, 8x Veggie Roll mit Schnittlauch, 2x Nigiri Avocado"],
    ["sushi", "Sushi-Menüs", "Maki Menü (24 Stück)", 16.4, 17.4, "sp-kat13", "8x Maki Kappa, 8x Maki Sake, 8x Maki Tekka"],
    ["sushi", "Sushi-Menüs", "Chef Menü (48 Stück)", 45.9, 49.9, "sp-kat13", "8x Crispy Tuna, 8x Crispy Chicken, 8x Sake Chizu Roll mit Tobiko, 8x Veggie Roll mit Schnittlauch, 8x Maki Avocado, 8x Maki Sake"],
    ["sushi", "Sushi-Menüs", "Nice Menü (32 Stück)", 27.5, 29.9, "sp-kat13", "8x Crispy Sake, 8x Maki Avocado, 8x Maki Ebi, 8x Sake Roll mit Sesam"],
    ["sushi", "Supreme Box", "Supreme Box 1 (64 Teile)", 68.9, 74.9, "sp-kat14", "8x Maki Kappa, 8x Maki Sake, 6 Spring Roll Lachs, 6 Spring Roll Tekka, 2x Nigiri Sake, 2x Nigiri Tekka, 8x Sake Chizu Roll mit Tobiko, 8x Surimi Roll mit Tobiko, 8x Veggie Roll mit Schnittlauch, 8x Chicken Roll mit Sesam"],
    ["sushi", "Supreme Box", "Supreme Box 2 (62 Teile)", 73.5, 79.9, "sp-kat14", "8x Maki Avocado, 8x Maki Sake Avocado, 8x Maki Tekka, 6x Spring Roll Lachs, 6x Spring Roll Chicken, 2x Nigiri Ebi, 2x Nigiri Sake Teriyaki, 2x Nigiri Tekka Teriyaki, 2x NigiriSake, 2x Nigiri Avocado, 8x Sake Roll mit Tobiko, 8x Tekka Chizu Roll mit Schnittlauch"],
    ["sushi", "Maki · 8 Stück", "Maki Sake", 6.2, 6.7, "sp-kat16", "mit Lachs"],
    ["sushi", "Maki · 8 Stück", "Maki Tekka", 7.4, 7.9, "sp-kat16", "mit Thunfisch"],
    ["sushi", "Maki · 8 Stück", "Maki Rucola", 5.4, 5.9, "sp-kat16", "mit Rucola und Frischkäse"],
    ["sushi", "Maki · 8 Stück", "Maki Ebi", 6.2, 6.7, "sp-kat16", "mit Garnelen"],
    ["sushi", "Maki · 8 Stück", "Maki Avocado", 5.3, 5.8, "sp-kat16", "mit Avocado"],
    ["sushi", "Maki · 8 Stück", "Maki Kappa", 5.0, 5.5, "sp-kat16", "mit Gurke und Frischkäse"],
    ["sushi", "Maki · 8 Stück", "Maki Paprika", 5.0, 5.5, "sp-kat16", "mit roter Paprika und Frischkäse"],
    ["sushi", "Maki · 8 Stück", "Maki Surimi", 6.2, 6.7, "sp-kat16", "mit Surimi und Avocado"],
    ["sushi", "Maki · 8 Stück", "Maki Rogen", 5.4, 5.9, "sp-kat16", "mit Tobiko"],
    ["sushi", "Maki · 8 Stück", "Maki Salmon", 6.2, 6.7, "sp-kat16", "mit gebratenem Lachs"],
    ["sushi", "Maki · 8 Stück", "Maki Chicken", 6.2, 6.7, "sp-kat16", "mit Chicken, Frischkäse und Schnittlauch"],
    ["sushi", "Maki · 8 Stück", "Maki Tuna", 7.5, 8.0, "sp-kat16", "mit gebratenem Thunfisch, Schnittlauch und Mayonnaise"],
    ["sushi", "California Roll · 8 Stück", "Sake Roll", 9.4, 9.9, "sp-kat18", "mit Lachs und Avocado"],
    ["sushi", "California Roll · 8 Stück", "Sake Chizu Roll", 9.2, 10.2, "sp-kat18", "mit Lachs, Gurke und Frischkäse"],
    ["sushi", "California Roll · 8 Stück", "Tekka Roll", 9.2, 10.2, "sp-kat18", "mit Thunfisch und Avocado"],
    ["sushi", "California Roll · 8 Stück", "Tekka Chizu Roll", 10.2, 11.2, "sp-kat18", "mit Thunfisch, Gurke und Frischkäse"],
    ["sushi", "California Roll · 8 Stück", "Surimi Roll", 9.1, 9.6, "sp-kat18", "mit Surimi und Avocado"],
    ["sushi", "California Roll · 8 Stück", "Veggie Roll", 8.4, 8.9, "sp-kat18", "mit rotem Paprika, Avocado, Gurke und Frischkäse"],
    ["sushi", "California Roll · 8 Stück", "Ebi Roll", 9.2, 10.2, "sp-kat18", "mit gebackener Garnele, Avocado und Sweet-Chilli-Sauce"],
    ["sushi", "California Roll · 8 Stück", "Salmon Roll", 9.4, 9.9, "sp-kat18", "mit gebratenem Lachs, Gurke und Mayonnaise"],
    ["sushi", "California Roll · 8 Stück", "Chicken Roll", 9.4, 9.9, "sp-kat18", "mit Chicken, Gurke und Frischkäse"],
    ["sushi", "California Roll · 8 Stück", "Tuna Roll", 10.5, 11.5, "sp-kat18", "mit gebratenem Thunfisch, Avocado und Mayonnaise"],
    ["sushi", "California Roll · 8 Stück", "Duck Roll", 10.5, 11.5, "sp-kat18", "mit Ente, Avocado und Schnittlauch"],
    ["sushi", "California Roll · 8 Stück", "Sake Rucola Roll", 9.4, 10.4, "sp-kat18", "mit Lachs, Rucola und Frischkäse"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Chicken", 10.9, 11.9, "sp-kat19", "mit Chicken, Gurke, Schnittlauch und Frischkäse"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Duck", 10.9, 11.9, "sp-kat19", "mit Ente, Avocado, Gurke und Mayonnaise"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Sake", 10.9, 11.9, "sp-kat19", "mit Lachs, Avocado, Mayonnaise und Schnittlauch"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Veggie", 9.9, 10.9, "sp-kat19", "mit roter Paprika, Gurke, Avocado und Frischkäse"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Ebi", 11.4, 12.4, "sp-kat19", "mit gebratener Garnele, Avocado. Schnittlauch und Sweet-Chilli-Sauce"],
    ["sushi", "Crispy Roll · 8 Stück", "Crispy Tuna", 11.4, 12.4, "sp-kat19", "mit gebratenem Thunfisch, Avocado und Mayonnaise"],
    ["sushi", "Special Roll · 8 Stück", "Tekka Special Roll", 11.9, 12.9, "sp-kat21", "mit Thunfisch, Tobiko, Gurke, Mayonnaise, dazu Avocado, Koriander und Teriyakisauce"],
    ["sushi", "Special Roll · 8 Stück", "Spicy Special Roll", 12.6, 13.6, "sp-kat21", "mit gebackener Garnele, Avocado, Sweet-Chili-Sauce, dazu Lachs, Sauce und Chilifäden"],
    ["sushi", "Special Roll · 8 Stück", "Salmon Special Roll", 11.4, 12.4, "sp-kat21", "mit gebratenem Lachs, Gurke, Mayonnaise, dazu Lachs, Sesam und Teriyakisauce"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Sake", 5.0, 5.5, "sp-kat20", "mit Lachs"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Tekka", 5.4, 5.9, "sp-kat20", "mit Thunfisch"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Ebi", 5.4, 5.9, "sp-kat20", "mit Garnele"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Avocado", 4.8, 5.3, "sp-kat20", "mit Avocado"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Sake Teriyaki", 5.4, 5.9, "sp-kat20", "mit Lachs, Teriyakisauce und Sesam"],
    ["sushi", "Nigiri · 2 Stück", "Nigiri Tekka Teriyaki", 5.9, 6.4, "sp-kat20", "mit Thunfisch, Teriyakisauce und Sesam"],
    ["sushi", "Sashimi · 6 Stück", "Sake Sashimi", 9.9, 10.9, "sp-kat17", "mit Lachs und Sojasauce"],
    ["sushi", "Sashimi · 6 Stück", "Tekka Sashimi", 10.9, 11.9, "sp-kat17", "mit Thunfisch und Sojasauce"],
    ["sushi", "Sashimi · 6 Stück", "Sashimi Mix", 10.4, 11.4, "sp-kat17", "3x Tekka Sashimi, 3x Sake Sashimi, Sojasauce"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Avocado", 6.4, 6.9, "sp-kat23", "mit Avocado und Frischkäse"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Kappa", 6.1, 6.6, "sp-kat23", "mit Gurke und Frischkäse"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Veggie", 7.0, 7.5, "sp-kat23", "mit Avocado, roter Paprika und Frischkäse"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Sake", 8.1, 8.6, "sp-kat23", "mit Lachs, Avocado und Frischkäse"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Tekka", 8.4, 8.9, "sp-kat23", "mit Thunfisch, Gurke und Frischkäse"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Surimi", 8.1, 8.6, "sp-kat23", "mit Surimi"],
    ["sushi", "Spring Roll · 6 Stück", "Spring Roll Chicken", 8.4, 8.9, "sp-kat23", "mit Chicken, Gurke, Frischkäse"],
    ["sushi", "Sticks & Fried", "Ebi Sticks (6 Stück)", 7.4, 7.9, "sp-kat24", "mit gebackener Garnele und Sweet-and-Spicy Mayonnaise"],
    ["sushi", "Sticks & Fried", "Sake Sticks (2 Stück)", 7.7, 8.2, "sp-kat24", "mit frittiertem Lachs, Teriyakisauce und Sesam"],
    ["sushi", "Sticks & Fried", "Tekka Sticks (2 Stück)", 8.7, 9.2, "sp-kat24", "mit frittiertem Thunfisch, Teriyakisauce und Sesam"],
    ["sushi", "Sticks & Fried", "Chicken Teriyaki Sticks (6 Stück)", 7.0, 7.5, "sp-kat24", "mit frittiertem Chicken und Teriyakisauce"],
    ["sushi", "Sticks & Fried", "Frühlingsrollen (8 Stück)", 4.7, null, "sp-kat24", "mit Sweet-Chili-Sauce"],
    ["sushi", "Sticks & Fried", "Teriyakisauce", 1.2, null, "sp-kat24", "35 ml"],
    ["sushi", "Sticks & Fried", "Sweet-and-Spicy Mayonnaise", 1.2, null, "sp-kat24", "35 ml"],
    ["sushi", "Sticks & Fried", "Kimchi Salat", 4.4, null, "sp-kat24", ""],
    ["sushi", "Sticks & Fried", "Erdnuss-Dip", 1.1, null, "sp-kat24", "35 ml"],
    ["sushi", "Sticks & Fried", "Wasabi-Dip", 1.1, null, "sp-kat24", "35 ml"],
    ["sushi", "Extras", "Edamame", 4.4, null, "sp-kat22", "gegarte Sojaschoten mit Salz"],
    ["sushi", "Extras", "Ingwer", 0.7, null, "sp-kat22", ""],
    ["sushi", "Extras", "Wasabi", 0.7, null, "sp-kat22", ""],
    ["sushi", "Extras", "Sojasauce", 1.9, null, "sp-kat22", "50 ml"],
    ["bowls", "", "Veggie Bowl", 12.9, 13.9, "sp-kat25", "Basic-Sushi Rice, Main-Avocado, Topping-rote Paprika, Gurke, Edamame, Mais, Sauce-Goma, Chrunch-geröstete Zwiebeln"],
    ["bowls", "", "Chicken Bowl", 13.9, 14.9, "sp-kat25", "Basic-Sushi Rice, Main-Chicken, Topping-Gurke, Mais, Rucola, Sauce-Teriyakisauce, Erdnuss-Sauce, Crunch-gerösteter Sesam, geröstete Zwiebeln"],
    ["bowls", "", "Spicy Lachs Bowl", 13.9, 14.9, "sp-kat25", "Basic-Sushi Rice, Main-Lachs, Topping-Kimchi, Mayo, Teriyakisauce, Crunch-Wasabi Nüsse"],
    ["bowls", "", "Sake Bowl", 13.9, 14.9, "sp-kat25", "Basic-Sushi Rice, Main-Lachs, Topping-Edamame, Ingwer, Frischkäse, Gurke, Sauce-Sojasauce, Crunch-gerösteter Sesam"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Classic", 3.5, null, "pizzabroetchen", ""],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Cheesy", 5.4, 5.9, "sp-kat5", "mit Gouda"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Tonnato", 6.4, 6.9, "sp-kat5", "mit Gouda und Thunfisch"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Cheesy veggi", 6.4, 6.9, "sp-kat5", "mit Gouda, Spinat und Hirtenkäse"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Cheesy Schinken", 6.4, 6.9, "sp-kat5", "mit Gouda, Schinken"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Sucuk", 6.4, 6.9, "sp-kat5", "mit Gouda, Hirtenkäse, Sucuk"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Chicken", 7.0, 7.5, "sp-kat5", "mit Gouda, Hähnchenbrustfilet, Zwiebeln und Jalapenos"],
    ["snacks", "Pizzabrötchen · 8 Stück mit Dip", "Pizzabrötchen Cheesy Salami", 6.4, 6.9, "sp-kat5", "mit Gouda und Salami"],
    ["snacks", "Finger Food", "Chicken Nuggets (9 Stück)", 6.4, 6.9, "sp-kat9", "mit Dip nach Wahl"],
    ["snacks", "Finger Food", "Chicken Wings (9 Stück)", 7.4, 7.9, "sp-kat9", "mit Dip nach Wahl"],
    ["snacks", "Finger Food", "Currywurst", 8.4, 8.9, "sp-kat9", "Würzige Geflügelwurst mit Pommes und Curry-Ketchup"],
    ["snacks", "Finger Food", "Pommes frites", 3.9, null, "pommes", "mit Dip nach Wahl"],
    ["snacks", "Finger Food", "Pizzabrot mit Käse", 4.5, null, "sp-kat9", "mit Dip nach Wahl"],
    ["snacks", "Finger Food", "Loaded Fries", 7.4, 7.9, "sp-kat9", "Pommes, Rinderhack, Jalapenos, Chilicheesesauce und BBQ-Sauce"],
    ["snacks", "Finger Food", "Knobi Sticks", 4.9, null, "knoblauch", "mit Knoblauch, Käse und Oregano"],
    ["dips", "", "American Dressing", 1.5, null, "sp-kat8", ""],
    ["dips", "", "BBQ-Sauce", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Chili Cheese Sauce", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Hollandaise Sauce", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Italian Dressing", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Joghurt Dressing", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Ketchup", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Knoblauch Sauce", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Mayonnaise", 1.5, null, "sp-kat8", ""],
    ["dips", "", "Remoulade", 1.5, null, "sp-kat8", ""],
    ["dessert", "", "Chocolate Lavacake", 2.99, null, "sp-kat10", "90g"],
    ["dessert", "", "Cheese Cake", 2.99, null, "sp-kat10", "100g"],
    ["dessert", "", "Tiramisu", 3.99, null, "sp-kat10", "90g"],
    ["dessert", "Mochi", "Mochi Schokokugeln", 5.2, 5.7, "sp-kat15", ""],
    ["dessert", "Mochi", "Mochi Cocoskugeln", 5.2, 5.7, "sp-kat15", ""],
    ["dessert", "Mochi", "Mochi Mixkugeln", 5.2, 5.7, "sp-kat15", ""],
    ["getraenke", "", "Coca Cola", 2.5, null, "sp-kat11", ""],
    ["getraenke", "", "Coca Cola Light", 2.5, null, "sp-kat11", ""],
    ["getraenke", "", "Fanta Orange", 3.5, null, "sp-kat11", ""],
    ["getraenke", "", "Sprite", 3.5, null, "sp-kat11", ""],
    ["getraenke", "", "Mezzo Mix", 3.5, null, "sp-kat11", ""],
    ["getraenke", "", "Capri Sonne", 1.0, null, "sp-kat11", ""],
    ["getraenke", "", "Capri Sonne Multivitamin", 1.0, null, "sp-kat11", "0,2 l"],
    ["getraenke", "", "Fuze Tea Pfirsich", 2.5, null, "sp-kat11", "0,33 l"],
    ["getraenke", "", "Fuze Tea Zitrone", 2.5, null, "sp-kat11", "0,33 l"],
    ["getraenke", "", "Vio Still", 2.3, null, "sp-kat11", ""],
    ["getraenke", "", "Vio Medium", 2.3, null, "sp-kat11", ""]
  ].map(function (g) { return { kat: g[0], gruppe: g[1], name: g[2], preis: g[3], statt: g[4], bild: g[5] ? "/assets/img/mittag/k/" + g[5] + ".webp" : "", text: g[6] }; });

  // Allergene je Gericht (Kennbuchstaben laut Legende). Wird aus Planung/Allergene-Vorlage.csv gefuellt.
  var ALLERGENE = {};
  var ALLERGEN_LEGENDE = [["A", "Glutenhaltiges Getreide"], ["B", "Krebstiere"], ["C", "Eier"], ["D", "Fisch"], ["E", "Erdnüsse"], ["F", "Soja"], ["G", "Milch / Laktose"],
    ["H", "Schalenfrüchte (Nüsse)"], ["J", "Schwefeldioxid / Sulfite"], ["K", "Senf"], ["L", "Sellerie"], ["M", "Sesam"], ["N", "Lupinen"], ["P", "Weichtiere"]];
  var ZUSATZ_LEGENDE = [["1", "mit Farbstoff"], ["2", "mit Konservierungsstoff"], ["3", "mit Antioxidationsmittel"], ["4", "mit Geschmacksverstärker"], ["5", "mit Süßungsmittel"],
    ["6", "geschwärzt"], ["7", "mit Phosphat"], ["12", "enthält eine Phenylalaninquelle"]];

  // Highlights: erscheinen im ersten Reiter und tragen ein Schild
  var TOP = {
    "Pizza Margherita": "Klassiker", "Pizza Chicken Supreme": "Spezialität", "Pizza BBQ Chicken": "Beliebt",
    "Pasta Supreme": "Hausrezept", "Calzone Gemischt": "Beliebt", "Schnitzel Wiener Art": "Klassiker",
    "Butter Chicken": "Bestseller", "Chicken Biryani": "Empfehlung", "Crispy Menü (24 Stück)": "Beliebt",
    "Supreme Box 1 (64 Teile)": "Fürs Team", "Chicken Bowl": "Empfehlung", "Loaded Fries": "Neu", "Tiramisu": "Hausgemacht"
  };
  KATS.unshift(["top", "★ Highlights"]);
  // Herkunft als kleine Flagge hinter dem Namen
  var FLAGGE = {
    it: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#009246"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ce2b37"/></svg>',
    in: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height=".67" fill="#ff9933"/><rect y=".67" width="3" height=".67" fill="#fff"/><rect y="1.33" width="3" height=".67" fill="#138808"/><circle cx="1.5" cy="1" r=".24" fill="none" stroke="#000080" stroke-width=".06"/></svg>',
    de: '<svg viewBox="0 0 5 3" aria-hidden="true"><rect width="5" height="1" fill="#000"/><rect y="1" width="5" height="1" fill="#dd0000"/><rect y="2" width="5" height="1" fill="#ffce00"/></svg>',
    jp: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><circle cx="1.5" cy="1" r=".6" fill="#bc002d"/></svg>',
    us: '<svg viewBox="0 0 19 10" aria-hidden="true"><rect width="19" height="10" fill="#b22234"/><path d="M0 1.15h19M0 2.7h19M0 4.23h19M0 5.77h19M0 7.3h19M0 8.85h19" stroke="#fff" stroke-width=".77"/><rect width="7.6" height="5.38" fill="#3c3b6e"/></svg>',
    tr: '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#e30a17"/><circle cx="11" cy="10" r="5" fill="#fff"/><circle cx="12.3" cy="10" r="4" fill="#e30a17"/><path d="M16.5 10l3.8-1.2-2.3 3.2V8l2.3 3.2z" fill="#fff"/></svg>',
    fr: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="1" height="2" fill="#0055a4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#ef4135"/></svg>',
    cn: '<svg viewBox="0 0 30 20" aria-hidden="true"><rect width="30" height="20" fill="#de2910"/><path d="M5 3l1.2 3.6H10L6.9 8.8 8.1 12.4 5 10.2 1.9 12.4 3.1 8.8 0 6.6h3.8z" fill="#ffde00"/></svg>',
    kr: '<svg viewBox="0 0 3 2" aria-hidden="true"><rect width="3" height="2" fill="#fff"/><path d="M1.5 .5a.5.5 0 0 1 0 1 .25.25 0 0 1 0-.5.25.25 0 0 0 0-.5" fill="#cd2e3a"/><path d="M1.5 1.5a.5.5 0 0 1 0-1 .25.25 0 0 1 0 .5.25.25 0 0 0 0 .5" fill="#0047a0"/></svg>'
  };
  var LANDNAME = { it: "Italienisch", in: "Indisch", de: "Deutsch", jp: "Japanisch", us: "Amerikanisch", tr: "Türkisch", fr: "Französisch", cn: "Chinesisch", kr: "Koreanisch" };
  // Jedes Gericht bekommt eine Herkunft - erst Einzelfaelle, dann nach Reiter
  var LAND_NAME = {
    "Tiramisu": "it", "Pizzabrot mit Käse": "it", "Knobi Sticks": "it", "Italian Dressing": "it",
    "Döner Wrap": "tr", "Pizza Kebab": "it", "Calzone mit Döner": "it", "Pizza Sucuk": "it", "Knoblauch Sauce": "tr", "Joghurt Dressing": "tr",
    "Currywurst": "de", "Pommes frites": "de", "Remoulade": "de", "Fanta Orange": "de", "Mezzo Mix": "de", "Vio Still": "de", "Vio Medium": "de",
    "Hollandaise Sauce": "fr", "Mayonnaise": "fr", "Chocolate Lavacake": "fr",
    "Frühlingsrollen (8 Stück)": "cn", "Kimchi Salat": "kr",
    "Cheese Cake": "us", "Chicken Nuggets (9 Stück)": "us", "Chicken Wings (9 Stück)": "us", "Loaded Fries": "us",
    "American Dressing": "us", "BBQ-Sauce": "us", "Chili Cheese Sauce": "us", "Ketchup": "us"
  };
  function land(g) {
    if (LAND_NAME[g.name]) return LAND_NAME[g.name];
    if (/^Capri Sonne/.test(g.name)) return "de";
    if (/^Mochi/.test(g.name)) return "jp";
    if (/Schnitzel/.test(g.name) || /^Pizzabrötchen/.test(g.name)) return "de";
    var k = { pizza: "it", calzone: "it", pasta: "it", indisch: "in", sushi: "jp", bowls: "jp", burger: "us", wraps: "us", getraenke: "us", dips: "us", snacks: "us", dessert: "it" };
    return k[g.kat] || "";
  }
  function flagge(g) { var l = g.land || land(g); return l ? '<span class="kx-flagge" title="' + LANDNAME[l] + '">' + FLAGGE[l] + "</span>" : ""; }

  var PAKETE = [
    { key: "pizza", name: "Pizza-Runde", preis: 12.9, statt: 14.5, bild: "margherita", text: "Pizzen Ø 30 cm (1 Pizza für 2 Personen), Knoblauchbrot, Rucola-Salat",
      wahl: { min: 1, max: 4, titel: "Welche Pizzen?", hilfe: "bis zu 4 Sorten", optionen: ["Margherita", "Salami", "Schinken", "Funghi", "Hawaii", "Tonno", "BBQ Chicken", "Green Garden"] } },
    { key: "pasta", name: "Pasta-Runde", preis: 16.9, statt: 18.9, bild: "carbonara", text: "2 Pastagerichte, Rucola-Salat, Knoblauchbrot",
      wahl: { min: 2, max: 2, titel: "Welche 2 Pastagerichte?", hilfe: "genau 2", optionen: ["Pasta Bolognese", "Pasta Milano", "Pasta Venezia", "Pasta Roma", "Pasta Supreme"] } },
    { key: "snack", name: "Meeting-Snack", preis: 11.9, statt: 13.5, bild: "samosa", text: "Fingerfood, etwa 6 Teile pro Person: Samosa, Pakora, Pizzabrötchen, Knoblauchbrot, Dips", wahl: null },
    { key: "curry", name: "Curry-Runde", preis: 18.9, statt: 21.5, bild: "butterchicken", text: "2 Currys, Basmati-Reis, Naan, Salat",
      wahl: { min: 2, max: 2, titel: "Welche 2 Currys?", hilfe: "genau 2", optionen: ["Butter Chicken", "Chicken Tikka Masala", "Chicken Korma", "Lamb Rogan Josh", "Palak Paneer", "Chana Masala", "Dal Tadka"] } },
    { key: "sushi", name: "Sushi-Runde", preis: 16.9, statt: 18.9, bild: "sushibox", text: "Gemischte Platte, etwa 12 Stück pro Person, mit Sojasauce, Ingwer und Wasabi",
      wahl: { min: 1, max: 1, titel: "Mit oder ohne Fisch?", hilfe: "", optionen: ["Gemischt mit Lachs und Thunfisch", "Nur vegetarisch"] } }
  ];

  // Buffet-Rechner: Preis pro Person je Gericht, Empfehlung = 27,50 (1/2/2/1)
  var BKATS = [["vorspeise", "Vorspeisen", 3.5], ["hauptgericht", "Hauptgerichte", 8], ["beilage", "Beilagen", 2.5], ["nachtisch", "Nachtisch", 3], ["sushi", "Sushi dazu", 0]];
  var BUFFET_GERICHTE = [
    ["vorspeise", "Gemüse-Samosas mit Minz-Chutney", "in", "Knusprig frittierte Teigtaschen gefüllt mit gewürzten Kartoffeln und Erbsen, serviert mit frischem Minz-Koriander-Chutney", "🌱"],
    ["vorspeise", "Pakora", "in", "Knusprig ausgebackene Gemüse-Happen im würzigen Kichererbsenteig mit Zwiebeln, Spinat und Chili – ein beliebter indischer Straßensnack", "🌱"],
    ["vorspeise", "Bruschetta al Pomodoro", "it", "Geröstetes Ciabatta mit frischen Tomaten, Knoblauch und Basilikum, beträufelt mit nativem Olivenöl extra", "🌱"],
    ["vorspeise", "Caprese mit Tomaten & Mozzarella", "it", "Frischer Büffelmozzarella mit sonnengereiften Tomaten und Basilikum, verfeinert mit Balsamico-Reduktion und Olivenöl", "🥚"],
    ["vorspeise", "Kartoffelsalat", "de", "Klassischer hausgemachter Kartoffelsalat mit feiner Senf-Vinaigrette, roten Zwiebeln und frischem Schnittlauch", "🥚"],
    ["vorspeise", "Gurkensalat mit Dill", "de", "Frisch geschnittene Gurken in einem leichten Essig-Dressing mit Dill und Zwiebeln – kühl, knackig und erfrischend", "🥚"],
    ["hauptgericht", "Butter Chicken", "in", "Zartes Hähnchenfleisch langsam geschmort in einer samtigen Tomatensauce mit Garam Masala, Kreuzkümmel und einem Hauch Sahne – mild-aromatisch und cremig", ""],
    ["hauptgericht", "Chicken Tikka Masala", "in", "Im Tandoor-Ofen gegrillte Hähnchenspieße in einer würzigen Tomatencreme-Sauce mit Bockshornklee, Ingwer und Koriander", ""],
    ["hauptgericht", "Lamm Rogan Josh", "in", "Langsam geschmortes Lammfleisch in einer intensiven Sauce aus Kashmiri-Chili, Kardamom und Joghurt – aromatisch und butterweich", ""],
    ["hauptgericht", "Chana Masala", "in", "Herzhafte Kichererbsen in einer würzigen Tomatensauce mit Kreuzkümmel, Koriander und frischem Ingwer – proteinreich", "🌱"],
    ["hauptgericht", "Gemüse-Curry", "in", "Saisonales Gemüse in einer aromatischen Kokosmilch-Currysauce mit Ingwer, Kurkuma und frischem Koriander", "🌱"],
    ["hauptgericht", "Palak Paneer", "in", "Frischer Hüttenkäse in einer cremigen Spinatsauce, gewürzt mit Kreuzkümmel, Knoblauch und Ingwer – ein indischer Klassiker", "🥚"],
    ["hauptgericht", "Lasagne al Forno", "it", "Hausgemachte Lasagne mit herzhafter Rind-Bolognese und klassischer Béchamelsauce, überbacken mit Parmesan und Mozzarella", ""],
    ["hauptgericht", "Penne Arrabbiata", "it", "Al dente Penne in einer feurigen Tomaten-Chili-Sauce mit Knoblauch und Basilikum – würzig und vollständig vegan", "🌱"],
    ["hauptgericht", "Penne al Pesto", "it", "Penne mit hausgemachtem Basilikum-Pesto aus frischen Kräutern, Pinienkernen und Olivenöl – mediterran und aromatisch", "🥚"],
    ["hauptgericht", "Melanzane alla Parmigiana", "it", "Geschichtete Auberginen mit Tomaten-Sugo, Basilikum und geschmolzenem Mozzarella – ein italienischer Klassiker ohne Fleisch", "🥚"],
    ["hauptgericht", "Pollo alla Parmigiana", "it", "Paniertes Hähnchenschnitzel auf Tomaten-Basilikum-Sugo, überbacken mit reichlich Mozzarella und frisch geriebenem Parmesan", ""],
    ["hauptgericht", "Gegrillte Hähnchenbrust", "de", "Saftige Hähnchenbrust vom Holzkohlegrill mit hausgemachter Kräuterbutter aus frischen Gartenkräutern, Zitrone und Knoblauch", ""],
    ["hauptgericht", "Rinderroulade", "de", "Zart gerolltes Rindfleisch gefüllt mit Senf, Speck, Zwiebeln und Gewürzgurke, langsam geschmort in kräftiger Bratensauce", ""],
    ["hauptgericht", "Käsespätzle", "de", "Handgemachte Spätzle überbacken mit würzigem Bergkäse und knusprigen Röstzwiebeln – schwäbische Hausmannskost", "🥚"],
    ["beilage", "Basmati-Reis", "in", "Locker gedämpfter Langkornreis mit einem Hauch Kardamom – ideale Begleitung zu Currys und Schmorgerichten", "🌱"],
    ["beilage", "Knoblauch-Naan", "in", "Frisch im Tandoor gebackenes indisches Fladenbrot mit Knoblauchbutter und Koriander – fluffig und duftend", "🥚"],
    ["beilage", "Raita", "in", "Erfrischender Joghurt-Dip mit Gurke, Minze und einer Prise Kreuzkümmel – kühlt und ergänzt würzige Currys perfekt", "🥚"],
    ["beilage", "Focaccia", "it", "Fluffiges italienisches Fladenbrot mit nativem Olivenöl, grobem Meersalz und frischem Rosmarin – knusprig außen, weich innen", "🌱"],
    ["beilage", "Italienischer gemischter Salat", "it", "Blattsalate, Kirschtomaten, Oliven und rote Zwiebeln mit leichtem Balsamico-Dressing", "🥚"],
    ["beilage", "Gegrilltes mediterranes Gemüse", "it", "Saisonales Gemüse auf dem Grill mit Olivenöl, Meersalz und mediterranen Kräutern – bunt, knackig und aromatisch", "🌱"],
    ["beilage", "Rosmarin-Kartoffeln", "de", "Ofenkartoffeln mit frischem Rosmarin, Knoblauch und Olivenöl – außen golden-knusprig, innen weich", "🌱"],
    ["beilage", "Rotkohl", "de", "Klassisch geschmorter Rotkohl mit Äpfeln, Gewürznelken und einem Schuss Rotweinessig – süßlich-herzhaft", "🌱"],
    ["beilage", "Krautsalat", "de", "Frisch geraspelter Weißkohl mit Essig-Öl-Dressing und Kümmel – knackig, bekömmlich und typisch deutsch", "🌱"],
    ["nachtisch", "Gulab Jamun", "in", "Zarte Milchpulver-Bällchen goldbraun frittiert, getränkt in einem duftenden Rosenwasser-Zuckersirup mit Kardamom", "🥚"],
    ["nachtisch", "Kheer", "in", "Cremiger indischer Milchreis mit Safran, Kardamom, Rosenwasser und gerösteten Pistazien – warm oder kalt ein Genuss", "🥚"],
    ["nachtisch", "Tiramisu", "it", "Klassisches Dessert aus espresso-getränkten Löffelbiskuits und luftig-cremiger Mascarpone-Creme, abgeschlossen mit feinem Kakaopulver", "🥚"],
    ["nachtisch", "Panna Cotta", "it", "Samtige Vanille-Sahne-Creme, serviert mit einem fruchtigen Beerenragout oder Karamellsauce – elegant und leicht", "🥚"],
    ["nachtisch", "Apfelstrudel mit Vanillesoße", "de", "Knuspriger Blätterteig gefüllt mit gezuckerten Äpfeln, Zimt und Rosinen, serviert mit warmer hausgemachter Vanillesoße", "🥚"],
    ["nachtisch", "Rote Grütze mit Vanillesoße", "de", "Fruchtige Beerenkompott aus Himbeeren, Kirschen und Johannisbeeren mit cremiger Vanillesoße", "🥚"],
    ["sushi", "Sushi-Platte gemischt", "jp", "Maki, California Rolls und Nigiri – etwa 6 Stück pro Person, mit Ingwer, Wasabi und Sojasauce", "", 4.9],
    ["sushi", "Sushi-Platte vegetarisch", "jp", "Maki Avocado, Kappa und Veggie Rolls – etwa 6 Stück pro Person", "veg", 4.5]
  ].map(function (b) { return { kat: b[0], name: b[1], land: b[2], text: b[3], veg: b[4] === "🌱" ? "vegan" : (b[4] === "🥚" || b[4] === "veg") ? "vegetarisch" : "", extra: b[5] || 0 }; });

  var ANLAESSE = ["Weihnachtsfeier", "Sommerfest", "Firmenjubiläum", "Meeting / Konferenz", "Geburtstag", "Hochzeit", "Vereinsfest", "Etwas anderes"];
  var WO = [
    { key: "haus", titel: "Bei uns im Haus", text: "Wir liefern das Buffet und bauen auf" },
    { key: "aussen", titel: "Außer Haus", text: "Wir finden eine passende Location" },
    { key: "offen", titel: "Weiß ich noch nicht", text: "Ich berate Sie zu beidem" }
  ];
  var KUECHEN = ["Deutsch", "Indisch", "Italienisch", "Sushi", "Vegetarisch im Mittelpunkt", "Fingerfood statt Buffet", "Überraschen Sie uns"];

  var $ = function (id) { return document.getElementById(id); };
  var app = $("kxApp"), laden = $("mkKarteLaden"), fehlerBox = $("mkKarteFehler");
  var schluessel = new URLSearchParams(location.search).get("k") || "";
  var bewegungAus = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  function fehler() { if (laden) laden.hidden = true; if (fehlerBox) fehlerBox.hidden = false; }
  if (!/^[0-9a-f]{32}$/.test(schluessel) || !window.mkBusiness) { fehler(); return; }
  var client = window.mkBusiness.client;

  function euro(n) { return n.toFixed(2).replace(".", ",") + " €"; }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : String(s); return d.innerHTML; }
  function isoTag(d) { return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function tagLang(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit" }); }
  function datumDe(iso) { return new Date(iso + "T12:00:00").toLocaleDateString("de-DE"); }

  var K = {};          // Kartendaten
  var S = {            // Zustand
    modus: "einzeln", kat: "top", menge: {}, paket: null, personen: 10, suess: false, wahl: [],
    tag: null, zeit: null, notiz: "",
    f: { anlass: "", datum: "", offen: false, personen: 30, wo: "", kueche: [], nachricht: "", plan: "", menu: [] }
  };

  // ---------- Navigation: ein Bildschirm nach dem anderen, Zurueck-Taste geht ----------
  var REIHE = ["start", "essen", "liefern", "feier1", "feier2", "feier3", "feier4", "menue", "feier5", "danke"];
  var aktuell = "start";
  function zeige(name, zurueck) {
    var alt = app.querySelector(".kx-screen.is-on");
    if (alt) alt.classList.remove("is-on", "is-back");
    var neu = app.querySelector('[data-screen="' + name + '"]');
    if (zurueck) neu.classList.add("is-back");
    neu.classList.add("is-on");
    aktuell = name;
    if (name.indexOf("feier") === 0) schritte(name);
    leiste();
    var oben = app.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > oben) window.scrollTo({ top: Math.max(0, oben), behavior: bewegungAus ? "auto" : "smooth" });
  }
  function geh(name, ersetzen) {
    var zurueck = REIHE.indexOf(name) < REIHE.indexOf(aktuell) && name !== "start";
    if (ersetzen) history.replaceState({ s: name }, ""); else history.pushState({ s: name }, "");
    zeige(name, zurueck || name === "start");
  }
  window.addEventListener("popstate", function (e) {
    var s = (e.state && e.state.s) || "start";
    if (s === "danke") s = "start";
    zeige(s, true);
  });
  app.addEventListener("click", function (e) {
    var b = e.target.closest("[data-back]");
    if (b) { e.preventDefault(); history.back(); }
  });

  function schritte(name) {
    var n = parseInt(name.slice(5), 10);
    Array.prototype.forEach.call(app.querySelectorAll('[data-screen="' + name + '"] .kx-schritte i'), function (i, idx) {
      i.classList.toggle("is-an", idx < n);
    });
  }

  // ---------- Leiste unten ----------
  var bar = $("kxBar"), barT = $("kxBarTitel"), barS = $("kxBarText"), barBtn = $("kxBarBtn"), barF = $("kxBarFehler");
  var barAktion = null;
  function setBar(an, titel, text, knopf, aktiv, aktion) {
    bar.classList.toggle("is-on", !!an);
    bar.setAttribute("aria-hidden", an ? "false" : "true");
    if (!an) return;
    barT.textContent = titel;
    var sp = text.indexOf("Sie sparen");
    barS.innerHTML = sp > -1 ? esc(text.slice(0, sp)) + '<span class="kx-spar">' + esc(text.slice(sp)) + "</span>" : esc(text);
    barBtn.innerHTML = esc(knopf) + ' <span aria-hidden="true">→</span>';
    barBtn.disabled = false;
    barBtn.classList.toggle("is-aus", !aktiv);
    barAktion = aktiv ? aktion : function () { barFehler(hinweisFuer()); bump(); };
  }
  // Warum geht es noch nicht weiter? Klarer Hinweis statt stummem grauen Knopf.
  function hinweisFuer() {
    if (aktuell === "essen" && S.modus === "einzeln") {
      var w = warenkorb();
      if (!w.n) return "Bitte zuerst ein Gericht mit + auswählen.";
      return "Mindestbestellwert für die Lieferung: " + MINDEST + " € – es fehlen noch " + euro(MINDEST - w.summe) + ".";
    }
    if (aktuell === "essen") { var p = paketObj(); if (!p) return "Bitte zuerst ein Paket wählen."; if (p.wahl) return "Bitte noch wählen: " + p.wahl.titel; return "Bitte mindestens 5 Personen angeben."; }
    if (aktuell === "liefern") return "Bitte noch einen Liefertag und eine Uhrzeit wählen.";
    if (aktuell === "menue") return S.f.menu.length ? "Bitte mindestens ein Hauptgericht wählen." : "Bitte zuerst Gerichte antippen.";
    return "Bitte die Angaben oben vervollständigen.";
  }
  function bump() { if (bewegungAus) return; bar.classList.remove("is-bump"); void bar.offsetWidth; bar.classList.add("is-bump"); }
  function barFehler(t) { barF.textContent = t; barF.hidden = !t; }
  barBtn.addEventListener("click", function () { barFehler(""); if (barAktion) barAktion(); });

  function warenkorb() {
    var n = 0, s = 0, liste = [];
    GERICHTE.forEach(function (g) { var m = S.menge[g.name] || 0; if (m) { n += m; s += m * g.preis; liste.push(m + "× " + g.name); } });
    return { n: n, summe: s, liste: liste };
  }
  function ersparnisEinzeln() { var e = 0; GERICHTE.forEach(function (g) { var m = S.menge[g.name] || 0; if (m && g.statt) e += m * (g.statt - g.preis); }); return Math.round(e * 100) / 100; }
  function ersparnisPaket() { var p = paketObj(); return p ? Math.round(S.personen * (p.statt - p.preis) * 100) / 100 : 0; }
  function ersparnisBuffet() { var p = buffetPreis(), n = Math.round(p * BUFFET_NORMAL / BUFFET * 10) / 10; return Math.round((n - p) * (S.f.personen || 0) * 100) / 100; }
  function sparText(e) { return e > 0 ? " · Sie sparen " + euro(e) : ""; }
  function paketObj() { return PAKETE.filter(function (p) { return p.key === S.paket; })[0] || null; }
  function paketSumme() { var p = paketObj(); return p ? S.personen * (p.preis + (S.suess ? SUESS : 0)) : 0; }
  function paketOk() {
    var p = paketObj(); if (!p || S.personen < 5) return false;
    return !p.wahl || (S.wahl.length >= p.wahl.min && S.wahl.length <= p.wahl.max);
  }

  function leiste() {
    barFehler("");
    if (aktuell === "essen") {
      if (S.modus === "einzeln") {
        var w = warenkorb();
        if (!w.n) return setBar(true, "Noch nichts ausgewählt", "Gerichte mit + hinzufügen · ab " + MINDEST + " € geliefert", "Weiter", false);
        var fehlt = MINDEST - w.summe;
        setBar(true, w.n + (w.n === 1 ? " Gericht" : " Gerichte") + " · " + euro(w.summe),
          fehlt > 0 ? "Noch " + euro(fehlt) + " bis zur Lieferung" + sparText(ersparnisEinzeln()) : "Lieferung inklusive" + sparText(ersparnisEinzeln()),
          "Weiter", fehlt <= 0, function () { geh("liefern"); });
      } else {
        var p = paketObj();
        if (!p) return setBar(true, "Paket wählen", "Ab 5 Personen · bis zum Vortag bestellen", "Weiter", false);
        var ok = paketOk();
        setBar(true, p.name + " · " + S.personen + " Pers. · " + euro(paketSumme()),
          ok ? euro(p.preis + (S.suess ? SUESS : 0)) + " pro Person" + sparText(ersparnisPaket()) : (p.wahl ? "Bitte noch wählen: " + p.wahl.titel.replace("?", "") : ""),
          "Weiter", ok, function () { geh("liefern"); });
      }
    } else if (aktuell === "liefern") {
      var titel = S.modus === "einzeln" ? warenkorb().n + " Gerichte · " + euro(warenkorb().summe) : (paketObj().name + " · " + S.personen + " Pers. · " + euro(paketSumme()));
      setBar(true, titel, S.tag && S.zeit ? tagLang(S.tag) + " · " + S.zeit + " Uhr" : "Tag und Uhrzeit wählen", "Jetzt bestellen", !!(S.tag && S.zeit), bestellen);
    } else if (aktuell === "feier2") {
      var datumOk = !!(S.f.datum || S.f.offen);
      setBar(true, S.f.anlass + (S.f.personen ? " · " + S.f.personen + " Personen" : ""),
        !S.f.personen ? "Bitte Gästezahl angeben" : S.f.datum ? new Date(S.f.datum + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long" }) : (S.f.offen ? "Termin noch offen" : "Termin wählen – oder „steht noch nicht fest“ ankreuzen"),
        "Weiter", true, function () {
          if (!S.f.personen) { var g = $("kxGaesteBox"); g.classList.remove("is-fehlt"); void g.offsetWidth; g.classList.add("is-fehlt"); g.scrollIntoView({ behavior: "smooth", block: "center" }); $("kxFPers").focus(); barFehler("Bitte zuerst die ungefähre Gästezahl angeben."); return; }
          if (!datumOk) { $("kxKal").scrollIntoView({ behavior: "smooth", block: "center" }); barFehler("Bitte einen Wunschtermin wählen – oder „steht noch nicht fest“ ankreuzen."); return; }
          geh("feier3");
        });
    } else if (aktuell === "menue" && !S.f.menu.length) {
      setBar(true, "Noch nichts ausgewählt", "Gerichte antippen – der Preis erscheint sofort", "Weiter", false);
    } else if (aktuell === "menue") {
      var pr = buffetPreis(), haupt = S.f.menu.filter(function (n) { return bObj(n).kat === "hauptgericht"; }).length;
      setBar(true, "Ihr Buffet · " + euro(pr) + " p. P.", S.f.personen ? S.f.personen + " Gäste · ca. " + euro(pr * S.f.personen + lieferGebuehr()) + (lieferGebuehr() ? " inkl. " + euro(LIEFER_GEBUEHR) + " Lieferung" : "") + sparText(ersparnisBuffet()) : "Gästezahl eintragen für den Gesamtpreis",
        haupt ? "Weiter" : "Bitte 1 Hauptgericht", haupt > 0, function () { S.f.plan = "selbst"; if (!S.f.anlass) geh("feier1"); else { zusammenfassung(); geh("feier5"); } });
    } else if (aktuell === "feier4" && S.f.plan !== "wir") {
      setBar(false);
    } else if (aktuell === "feier4") {
      setBar(true, S.f.anlass + (S.f.personen ? " · " + S.f.personen + " Personen" : ""), S.f.kueche.length ? S.f.kueche.join(", ") : "Küche wählen – oder einfach weiter",
        "Weiter", true, function () { zusammenfassung(); geh("feier5"); });
    } else if (aktuell === "feier5") {
      setBar(true, S.f.anlass + (S.f.personen ? " · " + S.f.personen + " Personen" : ""), "Unverbindlich · Antwort meist am selben Tag", "Anfrage senden", true, feierSenden);
    } else {
      setBar(false);
    }
  }

  // ---------- Start ----------
  function start() {
    var wer = K.ansprechpartner || K.firma;
    var std = new Date().getHours();
    $("kxGruss").textContent = (std < 11 ? "Guten Morgen" : std < 18 ? "Guten Tag" : "Guten Abend") + ",";
    $("kxName").textContent = wer + ".";
    $("kxSub").innerHTML = (K.ansprechpartner && K.kategorie !== "Privatperson" ? "<strong>" + esc(K.firma) + "</strong><br>" : "") + '<span style="white-space:nowrap">Kundennummer <strong>' + esc(K.kundennummer) + "</strong></span>";
    $("kxKarteName").textContent = K.firma;
    $("kxKarteNr").textContent = K.kundennummer;
    document.title = "MK Black Card " + K.kundennummer + " | Mahboobs Kitchen";

    var vorstellung = "Hallo Reyyan, hier ist " + wer + (K.kategorie !== "Privatperson" && K.ansprechpartner ? " von " + K.firma : "") + ". Meine Kundennummer: " + K.kundennummer;
    Array.prototype.forEach.call(app.querySelectorAll("[data-wa]"), function (l) { l.href = "https://wa.me/" + TEL_WA + "?text=" + encodeURIComponent(vorstellung); });
    // Unterer Chat startet, sobald er ins Bild kommt
    var unten = $("kxChatUnten");
    if (unten && "IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (e) { if (e[0].isIntersecting) { unten.classList.add("is-an"); io.disconnect(); } }, { threshold: 0.4 });
      io.observe(unten);
    } else if (unten) unten.classList.add("is-an");
    $("mkAbmelden").href = "/business/abmelden/?k=" + schluessel;

    // Saison: September bis 20. Dezember
    var jetzt = new Date(), mo = jetzt.getMonth();
    if (mo >= 8 && !(mo === 11 && jetzt.getDate() > 20)) {
      var dez = new Date(jetzt.getFullYear(), 11, 1), tage = Math.ceil((dez - jetzt) / 864e5);
      $("kxSaisonTitel").textContent = "Weihnachtsfeier " + jetzt.getFullYear();
      $("kxSaisonText").textContent = tage > 0 ? "Beliebte Termine sichern – noch " + tage + " Tage bis Dezember" : "Jetzt noch einen Termin sichern";
      $("kxSaison").hidden = false;
      $("kxSaison").onclick = function () { feierStart("Weihnachtsfeier"); };
    }

    wiederZeigen();

    Array.prototype.forEach.call(app.querySelectorAll("[data-go]"), function (b) {
      b.addEventListener("click", function () { if (b.dataset.go === "essen") essenStart(); else feierStart(); });
    });

    $("kxRueckruf").onclick = function () {
      var b = this; b.disabled = true;
      reaktion("rueckruf", null, "Rückruf über die Black Card").then(function (ok) {
        if (ok) { b.textContent = "✓ Ich rufe Sie zurück"; b.classList.add("kx-ok"); }
        else { b.disabled = false; b.textContent = "Bitte nochmal versuchen"; }
      });
    };
    angebote();
  }

  // Wie letztes Mal? - die letzte Bestellung steht auf diesem Geraet
  function wiederZeigen() {
    var letzte = null;
    try { letzte = JSON.parse(localStorage.getItem("mkLetzte_" + schluessel) || "null"); } catch (e) {}
    $("kxWieder").hidden = !(letzte && letzte.text);
    if (!letzte || !letzte.text) return;
    $("kxWiederText").textContent = letzte.text;
    $("kxWiederBtn").onclick = function () {
      if (letzte.modus === "einzeln") { S.modus = "einzeln"; S.menge = JSON.parse(JSON.stringify(letzte.menge || {})); }
      else { S.modus = "paket"; S.paket = letzte.paket; S.personen = letzte.personen || 10; S.suess = !!letzte.suess; S.wahl = (letzte.wahl || []).slice(); }
      essenStart(true);
    };
  }

  function reaktion(art, angebot, text) {
    return client.rpc("karte_reaktion", { p_token: schluessel, p_offer: angebot || null, p_art: art, p_text: text || null })
      .then(function (r) {
        if (r.error && /PGRST202|p_text|function/i.test(r.error.message || "")) return client.rpc("karte_reaktion", { p_token: schluessel, p_offer: angebot || null, p_art: art });
        return r;
      }).then(function (r) { return !r.error; }, function () { return false; });
  }
  function mail(betreff, felder) {
    if (!window.MK_FORMSPREE) return Promise.resolve(false);
    var d = { _subject: betreff + " – " + (K.firma || ""), Firma: K.firma || "—", Ansprechpartner: K.ansprechpartner || "—", Kundennummer: K.kundennummer || "—" };
    Object.keys(felder).forEach(function (k) { d[k] = felder[k]; });
    return fetch(window.MK_FORMSPREE, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(d) })
      .then(function (r) { return r.ok; }, function () { return false; });
  }

  function angebote() {
    client.from("offers").select("*").eq("active", true).order("created_at", { ascending: false }).then(function (res) {
      var heute = isoTag(new Date());
      var liste = (res.data || []).filter(function (o) { return !o.valid_until || o.valid_until >= heute; }).slice(0, 3);
      if (!liste.length) return;
      $("kxAngeboteListe").innerHTML = liste.map(function (o) {
        return '<div class="kx-angebot">' + (o.image_url ? '<img src="' + esc(o.image_url) + '" alt="" loading="lazy">' : "") +
          '<div class="kx-angebot__t"' + (o.image_url ? "" : ' style="grid-column:1/3"') + '><strong>' + esc(o.title) + "</strong>" +
          (o.description ? "<span>" + esc(o.description.length > 140 ? o.description.slice(0, 137) + "…" : o.description) + "</span>" : "") +
          (o.valid_until ? "<small>Gültig bis " + datumDe(o.valid_until) + "</small>" : "") + "</div>" +
          '<button type="button" class="kx-mini" data-angebot="' + esc(o.id) + '">Interesse</button></div>';
      }).join("");
      Array.prototype.forEach.call($("kxAngeboteListe").querySelectorAll("[data-angebot]"), function (b) {
        b.onclick = function () {
          b.disabled = true;
          reaktion("interesse", b.dataset.angebot).then(function (ok) {
            if (ok) { b.textContent = "✓ Ich melde mich"; b.classList.add("is-ok"); } else { b.disabled = false; }
          });
        };
      });
      $("kxAngebote").hidden = false;
    });
  }

  // ---------- Essen fuers Buero ----------
  var segPille = $("kxSegPille");
  function segment() {
    Array.prototype.forEach.call(app.querySelectorAll("[data-modus]"), function (b) {
      var an = b.dataset.modus === S.modus;
      b.classList.toggle("is-on", an); b.setAttribute("aria-pressed", an);
      if (an && segPille) { segPille.style.width = b.offsetWidth + "px"; segPille.style.transform = "translateX(" + (b.offsetLeft - 4) + "px)"; }
    });
    $("kxEinzeln").hidden = S.modus !== "einzeln";
    $("kxPaket").hidden = S.modus !== "paket";
  }
  function essenStart(wieder) {
    geh("essen");
    segment(); kategorien(); gerichte(); pakete(); leiste();
    if (wieder) bump();
  }
  Array.prototype.forEach.call(app.querySelectorAll("[data-modus]"), function (b) {
    b.addEventListener("click", function () { S.modus = b.dataset.modus; segment(); leiste(); });
  });
  window.addEventListener("resize", function () { if (aktuell === "essen") segment(); });

  function kategorien() {
    $("kxKats").innerHTML = KATS.map(function (k) {
      var n = 0; GERICHTE.forEach(function (g) { if (k[0] === "top" ? TOP[g.name] : g.kat === k[0]) n += S.menge[g.name] || 0; });
      return '<button type="button" class="kx-chip' + (S.kat === k[0] ? " is-on" : "") + '" data-kat="' + k[0] + '">' + k[1] + (n ? "<b>" + n + "</b>" : "") + "</button>";
    }).join("");
  }
  $("kxKats").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kat]"); if (!b) return;
    S.kat = b.dataset.kat; kategorien(); gerichte();
  });
  function gerichte() {
    var letzte = null, i = 0;
    $("kxGerichte").innerHTML = GERICHTE.filter(function (g) { return S.kat === "top" ? !!TOP[g.name] : g.kat === S.kat; }).map(function (g) {
      var m = S.menge[g.name] || 0, kopf = "";
      if (S.kat !== "top" && g.gruppe && g.gruppe !== letzte) { kopf = '<h3 class="kx-gruppe">' + esc(g.gruppe) + "</h3>"; letzte = g.gruppe; }
      return kopf + '<div class="kx-gericht' + (g.bild ? "" : " kx-gericht--ohne") + (m ? " is-gew" : "") + '" style="animation-delay:' + Math.min(0.5, (i++) * 0.03).toFixed(2) + 's" data-name="' + esc(g.name) + '">' +
        (g.bild ? '<span class="kx-gericht__bild"><img src="' + g.bild + '" alt="' + esc(g.name) + '" loading="lazy" width="112" height="112">' + (TOP[g.name] ? '<em class="kx-top">' + esc(TOP[g.name]) + "</em>" : "") + "</span>" : "") +
        '<div class="kx-gericht__t"><strong>' + esc(g.name) + flagge(g) + "</strong><small>" + esc(g.text || "") + (ALLERGENE[g.name] ? ' · <span class="kx-allerg">Allergene: ' + esc(ALLERGENE[g.name]) + "</span>" : "") + "</small>" +
        '<div class="kx-gericht__unten"><span class="kx-preis">' + euro(g.preis) + (g.statt ? "<s>" + euro(g.statt) + "</s>" : "") + "</span>" +
        '<span class="kx-menge"><button type="button" data-d="-1" aria-label="' + esc(g.name) + ' weniger">−</button><output>' + m + '</output><button type="button" class="kx-plus" data-d="1" aria-label="' + esc(g.name) + ' mehr">+</button></span>' +
        "</div></div></div>";
    }).join("");
  }
  $("kxGerichte").addEventListener("click", function (e) {
    var b = e.target.closest("[data-d]"); if (!b) return;
    var karte = b.closest("[data-name]"), name = karte.dataset.name;
    var m = Math.max(0, Math.min(50, (S.menge[name] || 0) + parseInt(b.dataset.d, 10)));
    S.menge[name] = m;
    var out = karte.querySelector("output"); out.textContent = m;
    out.classList.remove("is-pop"); void out.offsetWidth; out.classList.add("is-pop");
    karte.classList.toggle("is-gew", m > 0);
    kategorien(); leiste(); if (b.dataset.d === "1") bump();
  });

  function pakete() {
    $("kxPakete").innerHTML = PAKETE.map(function (p, i) {
      return '<button type="button" class="kx-paket' + (S.paket === p.key ? " is-on" : "") + '" data-paket="' + p.key + '" style="animation-delay:' + (i * 0.05) + 's">' +
        '<img src="/assets/img/mittag/' + p.bild + '.webp" alt="" loading="lazy">' +
        "<strong>" + p.name + "</strong><small>" + esc(p.text) + "</small>" +
        '<span class="kx-preis">' + euro(p.preis) + " p. P.<s>" + euro(p.statt) + "</s></span></button>";
    }).join("");
    paketWahl();
    $("kxPersonen").value = S.personen;
    $("kxSuess").checked = S.suess;
  }
  $("kxPakete").addEventListener("click", function (e) {
    var b = e.target.closest("[data-paket]"); if (!b) return;
    if (S.paket !== b.dataset.paket) S.wahl = [];
    S.paket = b.dataset.paket;
    Array.prototype.forEach.call($("kxPakete").children, function (x) { x.classList.toggle("is-on", x === b); });
    paketWahl(); leiste(); bump();
    $("kxPaketDetails").hidden = false;
    setTimeout(function () { $("kxPaketDetails").scrollIntoView({ behavior: bewegungAus ? "auto" : "smooth", block: "center" }); }, 150);
  });
  function paketWahl() {
    var p = paketObj();
    $("kxPaketDetails").hidden = !p;
    if (!p || !p.wahl) { $("kxWahlBox").innerHTML = ""; return; }
    $("kxWahlBox").innerHTML = '<p class="kx-unterfrage">' + esc(p.wahl.titel) + (p.wahl.hilfe ? "<small>" + esc(p.wahl.hilfe) + "</small>" : "") + "</p>" +
      '<div class="kx-chips" style="flex-wrap:wrap;overflow:visible;margin:0;padding:0">' + p.wahl.optionen.map(function (o) {
        return '<button type="button" class="kx-chip' + (S.wahl.indexOf(o) > -1 ? " is-on" : "") + '" data-wahl="' + esc(o) + '">' + esc(o) + "</button>";
      }).join("") + "</div>";
  }
  $("kxWahlBox").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wahl]"); if (!b) return;
    var p = paketObj(), o = b.dataset.wahl, i = S.wahl.indexOf(o);
    if (p.wahl.max === 1) S.wahl = [o];
    else if (i > -1) S.wahl.splice(i, 1);
    else if (S.wahl.length < p.wahl.max) S.wahl.push(o);
    else { S.wahl.shift(); S.wahl.push(o); }
    paketWahl(); leiste();
  });

  function zaehler(input, minus, plus, min, max, setze) {
    function set(v) { v = parseInt(v, 10); if (isNaN(v)) { if (input.value === "" && !input.dataset.start) { setze(null); return; } v = min; } v = Math.max(min, Math.min(max, v)); input.value = v; setze(v); }
    function halten(btn, d) {
      var t1, t2;
      function stop() { clearTimeout(t1); clearInterval(t2); }
      btn.addEventListener("pointerdown", function (e) {
        e.preventDefault(); set(input.value === "" ? (input.dataset.start ? +input.dataset.start : 20) : parseInt(input.value, 10) + d); var k = 0;
        t1 = setTimeout(function () { t2 = setInterval(function () { k++; set(parseInt(input.value, 10) + d * (k > 15 ? 5 : 1)); }, 80); }, 400);
      });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function (ev) { btn.addEventListener(ev, stop); });
      btn.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); set(parseInt(input.value, 10) + d); } });
    }
    halten(minus, -1); halten(plus, 1);
    input.addEventListener("change", function () { if (input.value === "") return setze(null); set(input.value); });
    input.addEventListener("input", function () { var v = parseInt(input.value, 10); if (input.value === "") setze(null); else if (!isNaN(v) && v >= min && v <= max) setze(v); });
    input.addEventListener("focus", function () { input.select(); });
  }
  $("kxPersonen").dataset.start = "10";
  zaehler($("kxPersonen"), $("kxPersMinus"), $("kxPersPlus"), 5, 300, function (v) { S.personen = v || 10; leiste(); });
  $("kxSuess").addEventListener("change", function () { S.suess = this.checked; leiste(); });

  // ---------- Liefertag & Uhrzeit ----------
  function lieferStart() {
    var tage = [], d = new Date(), jetzt = new Date();
    // Einzeln: heute moeglich, wenn noch eine Zeit mit 1 Stunde Vorlauf geht. Paket: ab morgen.
    if (S.modus === "paket" || jetzt.getHours() * 60 + jetzt.getMinutes() > 14 * 60) d.setDate(d.getDate() + 1);
    while (tage.length < 5) { if (d.getDay() !== 0 && d.getDay() !== 6) tage.push(isoTag(d)); d.setDate(d.getDate() + 1); }
    if (tage.indexOf(S.tag) === -1) S.tag = tage[0];
    $("kxTage").innerHTML = tage.map(function (t) {
      var x = new Date(t + "T12:00:00");
      var heute = t === isoTag(new Date()), morgen = t === isoTag(new Date(Date.now() + 864e5));
      return '<button type="button" class="kx-tag' + (S.tag === t ? " is-on" : "") + '" data-tag="' + t + '"><small>' +
        (heute ? "Heute" : morgen ? "Morgen" : x.toLocaleDateString("de-DE", { weekday: "short" })) + "</small><strong>" + x.getDate() + "." + (x.getMonth() + 1) + ".</strong></button>";
    }).join("");
    zeiten();
    $("kxLieferText").textContent = S.modus === "einzeln"
      ? "Montag bis Freitag zwischen 11:30 und 15:00 Uhr – frisch gekocht, mindestens 1 Stunde Vorlauf."
      : "Team-Pakete bestellen Sie bis zum Vortag – geliefert mit Servietten und Besteck.";
    $("kxNotiz").value = S.notiz;
  }
  function zeiten() {
    var heute = S.tag === isoTag(new Date()), jetzt = new Date(), grenze = jetzt.getHours() * 60 + jetzt.getMinutes() + 60;
    if (S.zeit && heute) { var p = S.zeit.split(":"); if (+p[0] * 60 + +p[1] < grenze) S.zeit = null; }
    $("kxZeiten").innerHTML = ZEITEN.map(function (z) {
      var p = z.split(":"), weg = heute && (+p[0] * 60 + +p[1] < grenze);
      return '<button type="button" class="kx-chip' + (S.zeit === z ? " is-on" : "") + '" data-zeit="' + z + '"' + (weg ? " disabled" : "") + ">" + z + "</button>";
    }).join("");
  }
  $("kxTage").addEventListener("click", function (e) {
    var b = e.target.closest("[data-tag]"); if (!b) return;
    S.tag = b.dataset.tag;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    zeiten(); leiste();
  });
  $("kxZeiten").addEventListener("click", function (e) {
    var b = e.target.closest("[data-zeit]"); if (!b || b.disabled) return;
    S.zeit = b.dataset.zeit; zeiten(); leiste(); bump();
  });
  $("kxNotiz").addEventListener("input", function () { S.notiz = this.value; });
  // Beim Wechsel auf "liefern" Tage aufbauen
  var _zeige = zeige;
  zeige = function (name, zurueck) { if (name === "liefern") lieferStart(); _zeige(name, zurueck); };

  function bestellen() {
    var tagText = tagLang(S.tag), notiz = (S.notiz || "").trim().replace(/\s+/g, " "), kurz, mehr, betreff, felder, danke, letzte;
    if (S.modus === "einzeln") {
      var w = warenkorb();
      kurz = "Mittagstisch · " + tagText + " · " + S.zeit + " Uhr · " + w.n + " Artikel";
      mehr = w.liste.join(", ") + " · " + euro(w.summe);
      betreff = "Mittagstisch-Bestellung: " + tagText + " " + S.zeit + " Uhr";
      felder = { Tag: tagText, Uhrzeit: S.zeit + " Uhr", Bestellung: w.liste.join(", "), Artikel: w.n, Summe: euro(w.summe), Notiz: notiz || "—" };
      danke = [["Bestellung", w.liste.join(", ")], ["Lieferung", tagText + " · " + S.zeit + " Uhr"], ["Summe", euro(w.summe)]];
      if (ersparnisEinzeln() > 0) danke.push(["Mit Black Card gespart", euro(ersparnisEinzeln())]);
      letzte = { modus: "einzeln", menge: S.menge, text: w.liste.join(", ") };
    } else {
      var p = paketObj(), s = paketSumme();
      kurz = "Team-Paket · " + p.name + " · " + tagText + " · " + S.zeit + " Uhr · " + S.personen + " Personen";
      mehr = (S.wahl.length ? S.wahl.join(", ") + " · " : "") + euro(p.preis) + " p. P." + (S.suess ? " + Süßes" : "") + " · " + euro(s);
      betreff = "Team-Paket: " + p.name + " · " + S.personen + " Pers. · " + tagText + " " + S.zeit + " Uhr";
      felder = { Paket: p.name, Auswahl: S.wahl.join(", ") || "—", Personen: S.personen, "Süßes dazu": S.suess ? "ja" : "nein", Tag: tagText, Uhrzeit: S.zeit + " Uhr", Summe: euro(s), Notiz: notiz || "—" };
      danke = [["Paket", p.name + (S.wahl.length ? " (" + S.wahl.join(", ") + ")" : "")], ["Personen", String(S.personen) + (S.suess ? " · mit Süßem" : "")], ["Lieferung", tagText + " · " + S.zeit + " Uhr"], ["Summe", euro(s)]];
      if (ersparnisPaket() > 0) danke.push(["Mit Black Card gespart", euro(ersparnisPaket())]);
      letzte = { modus: "paket", paket: p.key, personen: S.personen, suess: S.suess, wahl: S.wahl, text: p.name + " für " + S.personen + " Personen" };
    }
    barBtn.disabled = true; barBtn.textContent = "Wird gesendet …";
    Promise.all([reaktion("interesse", null, kurz + " | " + mehr + (notiz ? " | Notiz: " + notiz : "")), mail(betreff, felder)]).then(function (r) {
      if (!r[0] && !r[1]) { leiste(); barFehler("Das hat leider nicht geklappt – bitte nochmal versuchen oder anrufen: 0177 201 9889"); return; }
      try { localStorage.setItem("mkLetzte_" + schluessel, JSON.stringify(letzte)); } catch (e) {}
      wiederZeigen();
      dankeZeigen("Danke – Ihre Bestellung ist da.", "Ich bestätige sie Ihnen gleich persönlich per WhatsApp oder Anruf. Bezahlung bar, auf Rechnung oder per PayPal.", danke);
      S.menge = {}; S.paket = null; S.wahl = []; S.suess = false; S.tag = null; S.zeit = null; S.notiz = "";
    });
  }

  // ---------- Feier planen ----------
  function feierVorbereiten() {
    $("kxAnlaesse").innerHTML = ANLAESSE.map(function (a) { return '<button type="button" class="kx-chip' + (S.f.anlass === a ? " is-on" : "") + '" data-anlass="' + esc(a) + '">' + esc(a) + "</button>"; }).join("");
    $("kxWo").innerHTML = WO.map(function (w) { return '<button type="button" class="kx-chip" data-wo="' + w.key + '"><strong style="display:block;font-weight:500">' + w.titel + '</strong><small style="opacity:.7">' + w.text + "</small></button>"; }).join("");
    $("kxKuechen").innerHTML = KUECHEN.map(function (k) { return '<button type="button" class="kx-chip" data-kueche="' + esc(k) + '">' + esc(k) + "</button>"; }).join("");
    var heute = new Date(); kalAnsicht = new Date(heute.getFullYear(), heute.getMonth(), 1);
    $("kxOffen").checked = false; $("kxFPers").value = S.f.personen || ""; $("kxNachricht").value = ""; kalender();
  }
  function feierStart(anlass) {
    S.f = { anlass: anlass || "", datum: "", offen: false, personen: null, wo: "", kueche: [], nachricht: "", plan: "", menu: [] };
    planSetzen("");
    $("kxAnlaesse").innerHTML = ANLAESSE.map(function (a) { return '<button type="button" class="kx-chip' + (S.f.anlass === a ? " is-on" : "") + '" data-anlass="' + esc(a) + '">' + esc(a) + "</button>"; }).join("");
    $("kxWo").innerHTML = WO.map(function (w) { return '<button type="button" class="kx-chip" data-wo="' + w.key + '"><strong style="display:block;font-weight:500">' + w.titel + '</strong><small style="opacity:.7">' + w.text + "</small></button>"; }).join("");
    $("kxKuechen").innerHTML = KUECHEN.map(function (k) { return '<button type="button" class="kx-chip" data-kueche="' + esc(k) + '">' + esc(k) + "</button>"; }).join("");
    var heute = new Date();
    var schmal = window.matchMedia("(max-width: 860px)").matches;
    kalAnsicht = anlass === "Weihnachtsfeier" && heute.getMonth() < 11 ? new Date(heute.getFullYear(), schmal ? 11 : 10, 1) : new Date(heute.getFullYear(), heute.getMonth(), 1);
    $("kxOffen").checked = false;
    kalender();
    $("kxFPers").value = S.f.personen || "";
    $("kxNachricht").value = "";
    if (anlass) { $("kxF2Titel").textContent = "Wann und für wie viele?"; geh("feier2"); }
    else geh("feier1");
  }
  $("kxAnlaesse").addEventListener("click", function (e) {
    var b = e.target.closest("[data-anlass]"); if (!b) return;
    S.f.anlass = b.dataset.anlass;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    setTimeout(function () { geh("feier2"); }, bewegungAus ? 0 : 260);
  });
  // Kalender wie auf der Startseite: zwei Monate (Handy: einer), Do/Fr markiert, fruehestens in 3 Tagen
  var MONATE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var kalAnsicht = new Date();
  function kalMin() { var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3); return d; }
  function kalMonat(y, m) {
    var h = '<div class="kx-kal__m"><h4>' + MONATE[m] + " " + y + '</h4><div class="kx-kal__g">' +
      ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map(function (w) { return "<b>" + w + "</b>"; }).join("");
    var off = (new Date(y, m, 1).getDay() + 6) % 7, n = new Date(y, m + 1, 0).getDate(), min = kalMin();
    for (var i = 0; i < off; i++) h += "<i></i>";
    for (var d = 1; d <= n; d++) {
      var x = new Date(y, m, d), iso = isoTag(x), wd = x.getDay();
      h += '<button type="button" data-d="' + iso + '"' + (x < min ? " disabled" : "") + ' class="' + ((wd === 4 || wd === 5) ? "is-pop" : "") + (S.f.datum === iso ? " is-sel" : "") +
        '" aria-label="' + d + ". " + MONATE[m] + " " + y + '" aria-pressed="' + (S.f.datum === iso) + '">' + d + "</button>";
    }
    return h + "</div></div>";
  }
  function kalender() {
    var y = kalAnsicht.getFullYear(), m = kalAnsicht.getMonth(), min = kalMin();
    $("kxKalMonate").innerHTML = kalMonat(y, m) + kalMonat(m === 11 ? y + 1 : y, (m + 1) % 12);
    $("kxKalVor").disabled = y < min.getFullYear() || (y === min.getFullYear() && m <= min.getMonth());
    $("kxKalSel").textContent = S.f.datum ? new Date(S.f.datum + "T12:00:00").toLocaleDateString("de-DE", { weekday: "short", day: "numeric", month: "long", year: "numeric" }) : (S.f.offen ? "Noch offen" : "Bitte wählen");
    $("kxKal").classList.toggle("is-aus", S.f.offen);
  }
  $("kxKalVor").addEventListener("click", function () { kalAnsicht = new Date(kalAnsicht.getFullYear(), kalAnsicht.getMonth() - 1, 1); kalender(); });
  $("kxKalNach").addEventListener("click", function () { kalAnsicht = new Date(kalAnsicht.getFullYear(), kalAnsicht.getMonth() + 1, 1); kalender(); });
  $("kxKalMonate").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-d]"); if (!b || b.disabled) return;
    S.f.datum = b.dataset.d; S.f.offen = false; $("kxOffen").checked = false; kalender(); leiste(); bump();
  });
  $("kxOffen").addEventListener("change", function () { S.f.offen = this.checked; if (this.checked) S.f.datum = ""; kalender(); leiste(); });
  zaehler($("kxFPers"), $("kxFMinus"), $("kxFPlus"), 5, 1000, function (v) { S.f.personen = v; if (v) $("kxGaesteBox").classList.remove("is-fehlt"); leiste(); });
  $("kxWo").addEventListener("click", function (e) {
    var b = e.target.closest("[data-wo]"); if (!b) return;
    S.f.wo = b.dataset.wo;
    Array.prototype.forEach.call(this.children, function (x) { x.classList.toggle("is-on", x === b); });
    setTimeout(function () { if (S.f.plan === "selbst") { zusammenfassung(); geh("feier5"); } else geh("feier4"); }, bewegungAus ? 0 : 260);
  });
  $("kxKuechen").addEventListener("click", function (e) {
    var b = e.target.closest("[data-kueche]"); if (!b) return;
    var k = b.dataset.kueche, i = S.f.kueche.indexOf(k);
    if (i > -1) S.f.kueche.splice(i, 1); else S.f.kueche.push(k);
    b.classList.toggle("is-on", i === -1); leiste();
  });
  $("kxNachricht").addEventListener("input", function () { S.f.nachricht = this.value; });

  function woText() { var w = WO.filter(function (x) { return x.key === S.f.wo; })[0]; return w ? w.titel : "Noch offen"; }
  function feierZeilen() {
    var z = [["Anlass", S.f.anlass], ["Termin", S.f.datum ? datumDe(S.f.datum) : "noch offen"], ["Gäste", S.f.personen + " Personen"], ["Ort", woText()], ["Lieferung", lieferText()]];
    if (S.f.plan === "selbst") BKATS.forEach(function (k) {
      var n = S.f.menu.filter(function (x) { return bObj(x).kat === k[0]; });
      if (n.length) z.push([k[1], n.join(", ")]);
    });
    else z.push(["Küche", S.f.kueche.length ? S.f.kueche.join(", ") : "berate ich Sie gern"]);
    return z;
  }
  function zusammenfassung() {
    var z = feierZeilen();
    $("kxFSumme").innerHTML = z.map(function (r) { return '<div class="kx-summe__z"><span>' + r[0] + "</span><b>" + esc(r[1]) + "</b></div>"; }).join("") +
      (S.f.plan === "selbst" ? '<div class="kx-summe__z is-total"><span>Ihr Black-Card-Preis</span><b>' + (S.f.plan === "selbst" ? euro(buffetPreis()) : "ab " + euro(BUFFET)) + ' p. P.<br><small style="color:var(--mute);font-weight:400">statt ' + euro(S.f.plan === "selbst" ? Math.round(buffetPreis() * BUFFET_NORMAL / BUFFET * 10) / 10 : BUFFET_NORMAL) + " · ca. " + euro(S.f.personen * (S.f.plan === "selbst" ? buffetPreis() : BUFFET) + lieferGebuehr()).replace(",00", "") + " gesamt" + (lieferGebuehr() ? " inkl. Lieferung" : "") + "</small></b></div>" : '<div class="kx-summe__z is-total"><span>Preis</span><b>Ihr persönliches Angebot<br><small style="color:var(--mute);font-weight:400">kommt meist noch am selben Tag</small></b></div>') +
      (S.f.nachricht.trim() ? '<div class="kx-summe__z"><span>Nachricht</span><b>' + esc(S.f.nachricht.trim()) + "</b></div>" : "");
  }
  function feierSenden() {
    var kurz = S.f.anlass + " · " + (S.f.datum ? datumDe(S.f.datum) : "Termin offen") + " · " + S.f.personen + " Personen";
    var mehr = woText() + (S.f.plan === "selbst"
      ? " · Eigenes Menü: " + S.f.menu.join(", ") + " · " + euro(buffetPreis()) + " p. P. · ca. " + euro(buffetPreis() * S.f.personen + lieferGebuehr()) + (lieferGebuehr() ? " inkl. 25 € Lieferung" : "")
      : " · Küche: " + (S.f.kueche.join(", ") || "offen") + " · ab " + euro(BUFFET) + " p. P." + (lieferGebuehr() ? " · Lieferung 25 € (unter 20 Gäste)" : ""));
    var nachricht = S.f.nachricht.trim().replace(/\s+/g, " ");
    barBtn.disabled = true; barBtn.textContent = "Wird gesendet …";
    Promise.all([
      reaktion("interesse", null, kurz + " | " + mehr + (nachricht ? " | Nachricht: " + nachricht : "")),
      mail("Feier-Anfrage: " + kurz, { Anlass: S.f.anlass, Termin: S.f.datum ? datumDe(S.f.datum) : "offen", Personen: S.f.personen, Ort: woText(), Küche: S.f.plan === "selbst" ? "Eigenes Menü" : (S.f.kueche.join(", ") || "offen"), Menü: S.f.plan === "selbst" ? S.f.menu.join(", ") : "—", "Preis p. P.": S.f.plan === "selbst" ? euro(buffetPreis()) : "ab " + euro(BUFFET), Nachricht: nachricht || "—" })
    ]).then(function (r) {
      if (!r[0] && !r[1]) { leiste(); barFehler("Das hat leider nicht geklappt – bitte nochmal versuchen oder anrufen: 0177 201 9889"); return; }
      var fz = feierZeilen();
      if (S.f.plan === "selbst") { fz.push(["Ihr Preis", euro(buffetPreis()) + " p. P."]); if (ersparnisBuffet() > 0) fz.push(["Mit Black Card gespart", "ca. " + euro(ersparnisBuffet())]); }
      dankeZeigen("Danke – Ihre Anfrage ist da.", "Ich melde mich persönlich mit Ihrem Angebot, meist noch am selben Tag.", fz);
    });
  }

  // ---------- Buffet-Rechner ----------
  var bKat = "hauptgericht";
  function bObj(n) { return BUFFET_GERICHTE.filter(function (b) { return b.name === n; })[0] || {}; }
  function bPreisKat(k) { return (BKATS.filter(function (x) { return x[0] === k; })[0] || [0, 0, 0])[2]; }
  function buffetPreis() {
    var s = 0, extra = 0;
    S.f.menu.forEach(function (n) { var b = bObj(n); if (b.kat === "sushi") extra += b.extra; else s += bPreisKat(b.kat); });
    return Math.max(BUFFET, s) + extra;
  }
  function planSetzen(p) {
    S.f.plan = p;
    Array.prototype.forEach.call(app.querySelectorAll("[data-plan]"), function (b) { b.classList.toggle("is-on", b.dataset.plan === p); });
    $("kxWirBox").hidden = p !== "wir";
  }
  $("kxPlan").addEventListener("click", function (e) {
    var b = e.target.closest("[data-plan]"); if (!b) return;
    planSetzen(b.dataset.plan);
    if (b.dataset.plan === "selbst") { menueStart(); }
    else { leiste(); var box = $("kxWirBox"); setTimeout(function () { box.scrollIntoView({ behavior: bewegungAus ? "auto" : "smooth", block: "nearest" }); }, 120); }
  });
  function menueStart() {
    if (!S.f.menu) S.f.menu = [];
    $("kxMPers").value = S.f.personen || "";
    bKat = "vorspeise"; bKategorien(); bListe(); geh("menue");
  }
  function bKategorien() {
    $("kxMKats").innerHTML = BKATS.map(function (k) {
      var n = S.f.menu.filter(function (x) { return bObj(x).kat === k[0]; }).length;
      return '<button type="button" class="kx-chip' + (bKat === k[0] ? " is-on" : "") + '" data-bkat="' + k[0] + '">' + k[1] + (n ? "<b>" + n + "</b>" : "") + "</button>";
    }).join("");
    var k = BKATS.filter(function (x) { return x[0] === bKat; })[0];
    $("kxMInfo").innerHTML = bKat === "sushi"
      ? "Freiwillig dazu – als Extra zum Buffet."
      : "Je Gericht <b>" + euro(k[2]) + "</b> pro Person";
    // Faustregel-Checkliste
    var SOLL = { vorspeise: [1, "Vorspeise"], hauptgericht: [2, "Hauptgerichte"], beilage: [2, "Beilagen"], nachtisch: [1, "Nachtisch"], sushi: [0, "Sushi"] };
    $("kxGuideListe").innerHTML = Object.keys(SOLL).map(function (key) {
      var soll = SOLL[key][0], ist = S.f.menu.filter(function (x) { return bObj(x).kat === key; }).length, p = "";
      for (var i = 0; i < soll; i++) p += '<i class="' + (i < ist ? "is-voll" : "") + '"></i>';
      if (!soll) return '<li data-guide="' + key + '" class="kx-guide__extra' + (ist ? " is-ok" : "") + (bKat === key ? " is-an" : "") + '"><b>Sushi</b><span class="kx-guide__punkte"><small>' + (ist ? "dabei" : "optional") + "</small></span></li>";
      return '<li data-guide="' + key + '" class="' + (ist >= soll ? "is-ok" : "") + (bKat === key ? " is-an" : "") + '"><b>' + soll + " " + SOLL[key][1] + '</b><span class="kx-guide__punkte">' + p + "</span></li>";
    }).join("");
  }
  function bListe() {
    $("kxBuffet").innerHTML = BUFFET_GERICHTE.filter(function (b) { return b.kat === bKat; }).map(function (b, i) {
      var an = S.f.menu.indexOf(b.name) > -1;
      return '<button type="button" class="kx-bgericht' + (an ? " is-on" : "") + '" data-bname="' + esc(b.name) + '" aria-pressed="' + an + '" style="animation-delay:' + (i * 0.03).toFixed(2) + 's">' +
        "<strong>" + esc(b.name) + flagge({ kat: "", name: "", land: b.land }) + (b.veg ? '<span class="kx-veg">' + b.veg + "</span>" : "") + (b.extra ? ' <span style="color:var(--g2);font-weight:500">+' + euro(b.extra) + " p. P.</span>" : "") + "</strong>" +
        "<small>" + esc(b.text) + "</small></button>";
    }).join("");
  }
  $("kxMKats").addEventListener("click", function (e) { var b = e.target.closest("[data-bkat]"); if (!b) return; bKat = b.dataset.bkat; bKategorien(); bListe(); });
  $("kxBuffet").addEventListener("click", function (e) {
    var b = e.target.closest("[data-bname]"); if (!b) return;
    var n = b.dataset.bname, i = S.f.menu.indexOf(n);
    if (i > -1) S.f.menu.splice(i, 1); else S.f.menu.push(n);
    b.classList.toggle("is-on", i === -1); b.setAttribute("aria-pressed", i === -1);
    bKategorien(); leiste(); bump();
  });
  $("kxGuideListe").addEventListener("click", function (e) { var l = e.target.closest("[data-guide]"); if (!l) return; bKat = l.dataset.guide; bKategorien(); bListe(); });
  zaehler($("kxMPers"), $("kxMMinus"), $("kxMPlus"), 5, 1000, function (v) { S.f.personen = v; leiste(); });
  // "Nur mal schauen": Rechner direkt, ohne vorher Fragen
  function schauen() {
    S.f = { anlass: "", datum: "", offen: false, personen: null, wo: "", kueche: [], nachricht: "", plan: "selbst", menu: [] };
    feierVorbereiten(); menueStart();
  }

  // ---------- Allergene-Legende ----------
  Array.prototype.forEach.call(document.querySelectorAll("[data-allergene]"), function (b) {
    b.addEventListener("click", function () {
      $("kxAllergListe").innerHTML = ALLERGEN_LEGENDE.map(function (a) { return "<li><b>" + a[0] + "</b> " + esc(a[1]) + "</li>"; }).join("");
      $("kxZusatzListe").innerHTML = ZUSATZ_LEGENDE.map(function (a) { return "<li><b>" + a[0] + "</b> " + esc(a[1]) + "</li>"; }).join("");
      var dlg = $("kxAllergDlg"); if (dlg.parentNode !== document.body) document.body.appendChild(dlg);
      dlg.hidden = false;
    });
  });
  $("kxAllergZu").addEventListener("click", function () { $("kxAllergDlg").hidden = true; });
  $("kxAllergDlg").addEventListener("click", function (e) { if (e.target === this) this.hidden = true; });

  // ---------- Danke ----------
  function dankeZeigen(titel, text, zeilen) {
    $("kxDankeTitel").textContent = titel;
    $("kxDankeText").textContent = text;
    $("kxDankeSumme").innerHTML = zeilen.map(function (r) { var g = /gespart/.test(r[0]); return '<div class="kx-summe__z"><span' + (g ? ' class="kx-spar"' : "") + ">" + esc(r[0]) + "</span><b" + (g ? ' class="kx-spar"' : "") + ">" + esc(r[1]) + "</b></div>"; }).join("");
    var h = $("kxHaken"); var neu = h.cloneNode(true); h.parentNode.replaceChild(neu, h); // Animation neu starten
    geh("danke", true);
  }
  $("kxNochmal").addEventListener("click", function () { geh("start", true); });

  // Kategorie-Leisten mit der Maus ziehen (am Handy wischt man ohnehin)
  function ziehbar(el) {
    if (!el) return;
    var start = null, x0 = 0, s0 = 0, bewegt = false;
    el.addEventListener("pointerdown", function (e) { if (e.pointerType !== "mouse") return; start = true; bewegt = false; x0 = e.clientX; s0 = el.scrollLeft; });
    window.addEventListener("pointermove", function (e) {
      if (!start) return; var dx = e.clientX - x0;
      if (Math.abs(dx) > 5) { bewegt = true; el.classList.add("is-drag"); }
      if (bewegt) el.scrollLeft = s0 - dx;
    });
    window.addEventListener("pointerup", function () { if (!start) return; start = null; setTimeout(function () { el.classList.remove("is-drag"); }, 0); });
    function ende() { el.classList.toggle("is-ende", el.scrollLeft + el.clientWidth >= el.scrollWidth - 4); }
    el.addEventListener("scroll", ende, { passive: true }); window.addEventListener("resize", ende); setTimeout(ende, 300);
  }
  ziehbar($("kxKats"));

  // ---------- Laden ----------
  client.rpc("business_karte_anzeigen", { p_token: schluessel }).then(function (res) {
    if (res.error || !res.data || !res.data.kundennummer) throw res.error || new Error("nicht gefunden");
    K = res.data;
    history.replaceState({ s: "start" }, "");
    start();
    if (laden) laden.hidden = true;
    app.hidden = false;
    if (location.hash === "#weihnachten") feierStart("Weihnachtsfeier");
    else if (location.hash === "#bestellen") essenStart();
    else if (location.hash === "#rechner") schauen();
  }).catch(fehler);
})();
