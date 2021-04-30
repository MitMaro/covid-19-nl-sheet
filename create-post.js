'use strict';

const fetch = require('node-fetch');
const {padEnd, repeat} = require('lodash');
const neatCsv = require('neat-csv');

const sheet_csv = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRwIuL2anYaatsfT_ng5GJ1w2KqnNxe6srR3s43aZq5oI7FaIEwt2eP-kTnQePhNTORYgU0LH3HoSdq/pub?gid=1682143427&single=true&output=csv';

function format_table(headers, align, rows) {
	const column_lengths = headers.map((h) => h.length + 5);
	for (let row of rows) {
		for (let c_i in row) {
			if (column_lengths[c_i] < row[c_i].length + 1) {
				column_lengths[c_i] = row[c_i].length + 1;
			}
		}
	}

	const out = [];
	out.push(headers.map((h, i) => padEnd(`**${h}** `, column_lengths[i])).join('|'));
	out.push(headers.map((_, i) => {
		let sep = repeat('-', column_lengths[i] - 2);
		if (align[i] === 'l') {
			return `:-${sep}`;
		}
		else if (align[i] === 'r') {
			return `${sep}-:`;
		}
		else {
			return `${sep}--`;
		}
	}).join('|'));
	for (let row of rows) {
		out.push(row.map((c, i) => padEnd(`${c} `,  column_lengths[i])).join('|'));
	}

	return out.map((r) => `|${r}|`).join('\n');
}

function f_num(number) {
	let num = Number(number.replace(',', '').replace('+', ''));

	if (isNaN(num)) {
		return number;
	}
	if (num < 1000) {
		return num;
	}
	if (num < 10000) {
		return num.toLocaleString('en');
	}
	return `${Math.round(num/1000)}K`;
}

async function load_csv() {
	let response = await fetch(sheet_csv, {
		method: 'GET',
	});
	let data = (await response.text());

	let c = await neatCsv(data, {
		headers: [
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'
		]
	});

	let active_change;
	if (c[5].c === c[7].c) {
		let v = c[5].c.replace('+', '').replace('-', '');
		active_change = `+${v}/-${v}`;
	}
	else {
		active_change = c[6].c;
	}

	let summary_table = [
		[c[5].a, c[5].b, c[5].c],
		[c[6].a, c[6].b, active_change],
		[c[7].a, c[7].b, c[7].c],
		[c[8].a, c[8].b, c[8].c],
		[c[9].a, c[9].b, c[9].c],
		[c[10].a, c[10].b, c[10].c],
		[c[11].a, c[11].b, c[11].c],
	];

	let vaccinations_table = [
		['Received (Weekly Updated)', c[7].f, c[7].g],
		['Administered Total', c[11].f, c[11].g],
		['Administered Single Dose', c[12].f, c[12].g],
		['Administered Double Dose', c[13].f, c[13].g],
		['Remaining Does', c[17].f, c[17].g],
		['Overall Daily Rate', c[14].f, c[14].g],
		['Population Vaccinated', c[10].f, c[10].g],
		['Percent Doses Administered', c[15].f, c[15].g],
	];



	let demographics_table = [
		['Female', `${c[14].b} (${c[15].b})`, c[14].c],
		['Male', `${c[16].b} (${c[17].b})`, c[16].c],
		['< 20', c[18].b, c[18].c],
		['20-39', c[19].b, c[19].c],
		['40-49', c[20].b, c[20].c],
		['50-59', c[21].b, c[21].c],
		['60-69', c[22].b, c[22].c],
		['\\> 69', c[23].b, c[23].c],
	];


	let region_table = [
		[c[26].a, c[26].b, c[26].c],
		[c[27].a, c[27].b, c[27].c],
		[c[28].a, c[28].b, c[28].c],
		[c[29].a, c[29].b, c[29].c],
	];

	let stats_table = [
		['Days since first case', c[4].l],
		['Days vaccinating', c[5].l],
		['Days without new daily cases', c[6].l],
		['Days with new daily cases', c[7].l],
		['Days with no active cases', c[8].l],
		['Days since zero active cases', c[9].l],
		['Days since last non-epidemiological linked case', c[10].l],
		['Highest daily tests', `${c[11].l} (${c[11].k})`],
		['Lowest daily tests', `${c[12].l} (${c[12].k})`],
		[`Mortality rate (Canada: ${f_num(c[21].p)})`, c[13].l],
		[`Percent positive (Canada: ${f_num(c[8].p)})`, c[14].l],
		[`Percent recovered (Canada: ${f_num(c[19].p)})`, c[15].l],
		[`Tests per 1,000,000 (Canada: ${f_num(c[20].p)})`, c[16].l],
		[`Active cases per 100,000 (Canada: ${f_num(c[18].p)})`, c[17].l],
		[`Cases per 100,000 (Canada: ${f_num(c[17].p)})`, c[18].l],
		[`Cases per 100,000 - 14 Day (Canada: ${f_num(c[9].p)})`, c[19].l],
		[`Cases per 100,000 - 7 Day (Canada: ${f_num(c[10].p)})`, c[20].l],
		[`Fatalities per 100,000 (Canada: ${f_num(c[22].p)})`, c[21].l],
		[`Fatalities per 100,000 - 14 Day (Canada: ${f_num(c[11].p)})`, c[22].l],
		[`Fatalities per 100,000 - 7 Day (Canada: ${f_num(c[12].p)}))`, c[23].l],
	];


	console.log(
`
---

${format_table(
	['Summary', 'Value', 'Change'],
	['l', 'r', 'l'],
	summary_table
)}

---

- **Delivered Last Updated: ${c[6].g}**
- **Administered Last Updated: ${c[9].g}**

${format_table(
	['Vaccinations', 'Value', 'Change'],
	['l', 'r', 'l'],
	vaccinations_table
)}

---

${format_table(
	['Demographic', 'Value', 'Change'],
	['l', 'r', 'l'],
	demographics_table    
)}

---

${format_table(
	['Region', 'Value', 'Change'],
	['l', 'r', 'l'],
	region_table
)}


---

${format_table(
	['Statistic', 'Value'],
	['l', 'r'],
	stats_table
)}

**Canadian statistics last update date: ${c[24].k}**

---

Data and charts available in this [Google Sheet](https://docs.google.com/spreadsheets/d/1UhAtRLPapu0Cnl_8YgOXCrYHOBGqI6rpXjyczmvjfXk/edit).

---

Sources:

- [Latest Press Update](${c[23].p})
- [Government of Canada: Epidemiology Update](https://health-infobase.canada.ca/covid-19/epidemiological-summary-covid-19-cases.html)
- [GovNL: COVID-19 News](https://www.gov.nl.ca/releases/covid-19-news/)
- [GovNL: COVID-19 Pandemic Update Data Hub](https://covid-19-newfoundland-and-labrador-gnl.hub.arcgis.com/)

---

Please do not use this summary as your only source of information. Due to the lack of public data and potential mistakes, some numbers may be inaccurate.

`)
	}


async function main() {
	await load_csv();
}

main().catch(e => console.error(e));

