Dette er DBCs åbne platform, hvilket er APIet for de danske biblioteker.

Man skal være et dansk bibliotek, eller DDB, for at få API-adgang. Andre må sende forespørgslen gennem en af disse. <br>
Forespørgslen sendes til DBCs kundeservice (https://kundeservice.dbc.dk/) med følgende informationer:

- Projektejer kontaktperson (bibliotek, email, telefon)
- Teknisk kontaktperson (navn, email, telefon)
- Navn/beskrivelse af app/klient
- Eventuelt søge-profil (per default er dette det indloggede bibliotek. Alternative søgeprofiler kan være landsdækkende (bibliotek.dk), børnematerialer (palle), ...)

Herefter vil biblioteket modtage et eller flere `client_id` / `client_secret`, der kan bruges til at få adgang til APIet.

----
<br>

This is the DBCs Open Platform, which is the API for the danish public libraries.

Danish libraries can get access directly from DBC, see the description in danish above. Others have to go through a library to get access.

The latest version of the API is https://openplatform.dbc.dk/.
Source code, issue tracking, etc. is on github: https://github.com/dbcdk/serviceprovider/,
which also contains specification, and additional documentation, in [doc/](https://github.com/DBCDK/serviceprovider/tree/master/doc/).
A getting started guide is available here: [guide.html](guide.html).

