/* eslint-disable max-len, quotes, comma-spacing, key-spacing, quote-props */
'use strict';
import Provider from '../Provider.js';
import {assert} from 'chai';

let provider = Provider();
let mockData = {"[\"http://xp-p02.dbc.dk/rank\",{\"uri\":\"http://xp-p02.dbc.dk/rank\",\"method\":\"POST\",\"json\":{\"like\":[\"870970-basis:45488713\",\"870970-basis:28643713\",\"870970-basis:29494940\",\"870970-basis:29386404\",\"870970-basis:28429576\"],\"set\":[\"870970-basis:28511663\",\"870970-basis:29754519\",\"870970-basis:29060835\",\"870970-basis:28567057\",\"870970-basis:28043872\",\"870970-basis:28709994\",\"870970-basis:29319006\",\"870970-basis:27266428\",\"870970-basis:28724683\",\"870970-basis:26923530\",\"870970-basis:29974861\",\"870970-basis:28456433\",\"870970-basis:28902239\",\"870970-basis:45188981\"]}}]":{"result":[["870970-basis:28709994",{"title":"Fyrmesteren : kriminalroman","creator":"Camilla Läckberg","val":160.35303598205383,"ctkey":"Fyrmesteren_:_kriminalroman::Camilla_Läckberg","pid":"870970-basis:28709994"}],["870970-basis:45188981",{"title":"Englemagersken : kriminalroman","creator":"Camilla Läckberg","val":156.37673714369217,"ctkey":"Englemagersken_:_kriminalroman::Camilla_Läckberg","pid":"870970-basis:45188981"}],["870970-basis:29060835",{"title":"De glemte piger : krimi","creator":"Sara Blædel","val":154.94287546424368,"ctkey":"De_glemte_piger_:_krimi::Sara_Blædel","pid":"870970-basis:29060835"}],["870970-basis:28567057",{"title":"Dødsenglen : krimi","creator":"Sara Blædel","val":152.79449728082864,"ctkey":"Dødsenglen_:_krimi::Sara_Blædel","pid":"870970-basis:28567057"}],["870970-basis:28724683",{"title":"Tre hundes nat","creator":"Elsebeth Egholm","val":152.4351523893472,"ctkey":"Tre_hundes_nat::Elsebeth_Egholm","pid":"870970-basis:28724683"}],["870970-basis:29319006",{"title":"Hævnens gudinde : krimi","creator":"Sara Blædel","val":137.19556270267927,"ctkey":"Hævnens_gudinde_:_krimi::Sara_Blædel","pid":"870970-basis:29319006"}],["870970-basis:29754519",{"title":"Marco effekten : krimithriller","creator":"Jussi Adler-Olsen","val":135.12674503355157,"ctkey":"Marco_effekten_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:29754519"}],["870970-basis:28511663",{"title":"Journal 64 : krimithriller","creator":"Jussi Adler-Olsen","val":125.28970604409433,"ctkey":"Journal_64_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:28511663"}],["870970-basis:28043872",{"title":"Flaskepost fra P : krimithriller","creator":"Jussi Adler-Olsen","val":111.80156092338498,"ctkey":"Flaskepost_fra_P_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:28043872"}],["870970-basis:28902239",{"title":"Det syvende barn","creator":"Erik Valeur","val":103.90192806553446,"ctkey":"Det_syvende_barn::Erik_Valeur","pid":"870970-basis:28902239"}],["870970-basis:27266428",{"title":"Fasandræberne : krimithriller","creator":"Jussi Adler-Olsen","val":97.96675452808782,"ctkey":"Fasandræberne_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:27266428"}],["870970-basis:26923530",{"title":"Kvinden i buret : krimi","creator":"Jussi Adler-Olsen","val":97.26147565144235,"ctkey":"Kvinden_i_buret_:_krimi::Jussi_Adler-Olsen","pid":"870970-basis:26923530"}],["870970-basis:29974861",{"title":"Og bjergene gav genlyd","creator":"Khaled Hosseini","val":93.82172425193735,"ctkey":"Og_bjergene_gav_genlyd::Khaled_Hosseini","pid":"870970-basis:29974861"}],["870970-basis:28456433",{"title":"Giganternes fald","creator":"Ken Follett","val":83.32698412417399,"ctkey":"Giganternes_fald::Ken_Follett","pid":"870970-basis:28456433"}]],"msecs":"not set"}};

describe('Automated test of the rank endpoint', () => {
  it('expected response. ID:3sx9lp, for {"pids":["870970-basis:28511663","870970-basis:29754519","870970-basis:29060835","870970-basis:28567057","870970-basis:28043872","870970-basis:28709994","870970-basis:29319006","870970-basis:27266428","870970-basis:28724683","870970-basis:26923530","870970-basis:29974861","870970-basis:28456433","870970-basis:28902239","870970-basis:45188981"],"like":["870970-basis:45488713","870970-basis:28643713","870970-basis:29494940","870970-basis:29386404","870970-basis:28429576"]}', (done) => {
    let context = {"opensearch":{"url":"http://opensearch.addi.dk/b3.0_4.2/","agency":"775100","profile":"opac"},"moreinfo":{"url":"http://moreinfo.addi.dk/2.1/","user":"XXXXX","group":"XXXXX","password":"XXXXX"},"entitysuggest":{"url":"http://xptest.dbc.dk/ms/entity-suggest/v1","libraryType":"folkebibliotek"},"popsuggest":{"url":"http://xptest.dbc.dk/ms/entity-pop/v1"},"creatorsuggest":{"url":"http://xptest.dbc.dk/ms/entity-suggest/v1/creator"},"librarysuggest":{"url":"http://xptest.dbc.dk/ms/entity-suggest/v1/library","librarytype":"folkebibliotek"},"subjectsuggest":{"url":"http://xptest.dbc.dk/ms/entity-suggest/v1/subject"},"orderpolicy":{"url":"https://openorder.addi.dk/test_2.7.1/","servicerequester":"190101"},"userstatus":{"salt":"XXXXX","url":"https://openuserstatus.addi.dk/1.4.1/","userid":"XXXXX","userpin":"XXXXX","useragency":"DK-100451","authgroupid":"XXXXX","authpassword":"XXXXX","authid":"XXXXX"},"recommend":{"urls":{"default":"https://xptest.dbc.dk/ms/recommend-cosim/v1","popular":"https://xptest.dbc.dk/ms/recommend-pop/v1"}},"openagency":{"url":"http://openagency.addi.dk/2.24/","agency":"775100"},"ddbcms":{"url":"http://rest.filmstriben.dbc.inlead.dk/web/","agency":"775100","password":"XXXXX"},"openholdingstatus":{"url":"https://openholdingstatus.addi.dk/2.2/","authgroupid":"XXXXX","authpassword":"XXXXX","authid":"XXXXX"},"rank":{"url":"http://xp-p02.dbc.dk/rank"}};
    context.mockData = mockData;
    provider.execute('rank', {"pids":["870970-basis:28511663","870970-basis:29754519","870970-basis:29060835","870970-basis:28567057","870970-basis:28043872","870970-basis:28709994","870970-basis:29319006","870970-basis:27266428","870970-basis:28724683","870970-basis:26923530","870970-basis:29974861","870970-basis:28456433","870970-basis:28902239","870970-basis:45188981"],"like":["870970-basis:45488713","870970-basis:28643713","870970-basis:29494940","870970-basis:29386404","870970-basis:28429576"]}, context)
      .then(result => {
        assert.deepEqual(result,
            {"statusCode":200,"data":[{"title":"Fyrmesteren : kriminalroman","creator":"Camilla Läckberg","val":160.35303598205383,"ctkey":"Fyrmesteren_:_kriminalroman::Camilla_Läckberg","pid":"870970-basis:28709994"},{"title":"Englemagersken : kriminalroman","creator":"Camilla Läckberg","val":156.37673714369217,"ctkey":"Englemagersken_:_kriminalroman::Camilla_Läckberg","pid":"870970-basis:45188981"},{"title":"De glemte piger : krimi","creator":"Sara Blædel","val":154.94287546424368,"ctkey":"De_glemte_piger_:_krimi::Sara_Blædel","pid":"870970-basis:29060835"},{"title":"Dødsenglen : krimi","creator":"Sara Blædel","val":152.79449728082864,"ctkey":"Dødsenglen_:_krimi::Sara_Blædel","pid":"870970-basis:28567057"},{"title":"Tre hundes nat","creator":"Elsebeth Egholm","val":152.4351523893472,"ctkey":"Tre_hundes_nat::Elsebeth_Egholm","pid":"870970-basis:28724683"},{"title":"Hævnens gudinde : krimi","creator":"Sara Blædel","val":137.19556270267927,"ctkey":"Hævnens_gudinde_:_krimi::Sara_Blædel","pid":"870970-basis:29319006"},{"title":"Marco effekten : krimithriller","creator":"Jussi Adler-Olsen","val":135.12674503355157,"ctkey":"Marco_effekten_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:29754519"},{"title":"Journal 64 : krimithriller","creator":"Jussi Adler-Olsen","val":125.28970604409433,"ctkey":"Journal_64_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:28511663"},{"title":"Flaskepost fra P : krimithriller","creator":"Jussi Adler-Olsen","val":111.80156092338498,"ctkey":"Flaskepost_fra_P_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:28043872"},{"title":"Det syvende barn","creator":"Erik Valeur","val":103.90192806553446,"ctkey":"Det_syvende_barn::Erik_Valeur","pid":"870970-basis:28902239"},{"title":"Fasandræberne : krimithriller","creator":"Jussi Adler-Olsen","val":97.96675452808782,"ctkey":"Fasandræberne_:_krimithriller::Jussi_Adler-Olsen","pid":"870970-basis:27266428"},{"title":"Kvinden i buret : krimi","creator":"Jussi Adler-Olsen","val":97.26147565144235,"ctkey":"Kvinden_i_buret_:_krimi::Jussi_Adler-Olsen","pid":"870970-basis:26923530"},{"title":"Og bjergene gav genlyd","creator":"Khaled Hosseini","val":93.82172425193735,"ctkey":"Og_bjergene_gav_genlyd::Khaled_Hosseini","pid":"870970-basis:29974861"},{"title":"Giganternes fald","creator":"Ken Follett","val":83.32698412417399,"ctkey":"Giganternes_fald::Ken_Follett","pid":"870970-basis:28456433"}]});
        done();
      });
  });
});
