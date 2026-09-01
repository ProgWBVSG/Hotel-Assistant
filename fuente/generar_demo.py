# -*- coding: utf-8 -*-
"""
Genera datos de EJEMPLO, inventados, para el repositorio publico.

No sale ningun numero, nombre ni comentario del hotel. Se imitan las formas
(cuanto suele variar cada area, dias normales contra dias de evento) para que
la aplicacion se vea realista, pero los valores son generados.
"""
import json, io, random, datetime, os

random.seed(20260827)          # mismo resultado en cada corrida
os.chdir(os.path.dirname(__file__))

NOMBRES = ['Alex', 'Sam', 'Jordan', 'Casey', 'Riley', 'Morgan', 'Taylor',
           'Blake', 'Robin', 'Avery', 'Quinn', 'Skyler', 'Drew', 'Reese']

COMENTARIOS = {
  'Penny Blue': [
    'Busy evening across the restaurant. Two large tables extended past closing and service ran smoothly.',
    'A table raised a concern about the wait between courses. The kitchen was informed and a dessert was offered.',
    'Quiet service overall. Good opportunity to run through the new menu with the floor team.',
    'Private dining booking for 24 guests. Set menu ran on time and feedback was positive.',
  ],
  'Exchange Lane': [
    'The bar filled up between 18:00 and 21:00 with several small groups. Mostly in-house guests.',
    'Steady lunch service. A guest asked about gluten free options; the kitchen adjusted the dish.',
    'A group arrived after a nearby event, which created a busy period for about an hour.',
    'Slow start to the evening. Stock count completed during the quiet period.',
  ],
  'In Room Dining': [
    'Orders peaked at the same time as the bar. Guests were kept informed about waiting times.',
    'An order was delayed due to an incorrect room number. Corrected and delivered with an apology.',
    'Quiet overnight service. Breakfast preparation completed ahead of schedule.',
    'Several breakfast orders arrived within the same fifteen minutes, causing a short delay.',
  ]
}

# Quien trabaja en cada salon. En el hotel no son los mismos: el que atiende
# Penny Blue no es el que sale a las habitaciones.
PLANTEL = {
    'Penny Blue':     ['Robin', 'Morgan', 'Reese', 'Alex', 'Jordan', 'Sam'],
    'Exchange Lane':  ['Casey', 'Riley', 'Quinn', 'Avery'],
    'In Room Dining': ['Taylor', 'Jamie', 'Drew'],
}

# Turnos que cruzan la noche: entran a la tarde y salen de madrugada.
TURNOS_NOCHE = [
    (19 * 60, 27 * 60, 30),      # 19:00 a 03:00
    (22 * 60, 30 * 60, 30),      # 22:00 a 06:00
    (15 * 60, 23 * 60, 30),      # 15:00 a 23:00
]

TURNOS_TIPO = [(17*60, 23*60, 30), (18*60, 24*60, 30), (11*60, 20*60+30, 30),
               (16*60, 24*60+30, 30), (6*60, 14*60, 30), (14*60, 22*60, 30)]


def plata(base, variacion):
    return round(base * random.uniform(1 - variacion, 1 + variacion), 2)


def servicio(cubiertos, comida, bebida, extra=None):
    m = {'Covers': cubiertos, 'Food': comida, 'Beverage': bebida}
    total = comida + bebida
    if extra:
        for k, v in extra.items():
            m[k] = v
            total += v
    m['Total'] = round(total, 2)
    if cubiertos:
        m['AV Check'] = round(total / cubiertos, 2)
    if random.random() < 0.55:
        m['Discounts'] = round(total * random.uniform(0.02, 0.16), 2)
    return m


def sumar(servicios, campos):
    ad = {}
    for c in campos:
        s = sum(sv.get(c, 0) for sv in servicios)
        if s:
            ad[c] = round(s, 2)
    ad['Total'] = round(sum(sv.get('Total', 0) for sv in servicios), 2)
    if ad.get('Covers'):
        ad['AV Check'] = round(ad['Total'] / ad['Covers'], 2)
    return ad


def armar_dia(fecha, evento):
    areas = {}

    # --- Penny Blue: dos modos, normal y dia de evento ---
    pb = {}
    if evento:
        pb['Breakfast'] = servicio(random.randint(40, 70), plata(2000, .2), plata(120, .5))
        pb['Lunch'] = servicio(random.randint(0, 30), plata(600, .6), plata(300, .6))
        pb['Dinner'] = servicio(random.randint(90, 140), plata(6500, .18), plata(3800, .25),
                                {'Misc/Banquets': plata(900, .5)})
    else:
        pb['Breakfast'] = servicio(random.randint(35, 65), plata(1800, .25), plata(90, .6))
        pb['Lunch'] = servicio(random.randint(0, 20), plata(300, .8), plata(150, .8))
        pb['Dinner'] = servicio(random.randint(20, 55), plata(1900, .35), plata(1100, .4))
    pb['All Day'] = sumar([pb['Breakfast'], pb['Lunch'], pb['Dinner']],
                          ['Covers', 'Food', 'Beverage', 'Discounts', 'Misc/Banquets'])
    areas['Penny Blue'] = pb

    # --- Exchange Lane: estable ---
    el = {}
    el['Breakfast'] = servicio(random.randint(110, 190), plata(1350, .22), plata(30, .8))
    el['Lunch'] = servicio(random.randint(60, 120), plata(900, .3), plata(280, .4))
    el['Dinner'] = servicio(random.randint(45, 90), plata(1500, .3), plata(1700, .35))
    el['All Day'] = sumar([el['Breakfast'], el['Lunch'], el['Dinner']],
                          ['Covers', 'Food', 'Beverage', 'Discounts'])
    areas['Exchange Lane'] = el

    # --- In Room Dining: chico y estable ---
    ird = {}
    ird['Breakfast'] = servicio(random.randint(1, 6), plata(60, .7), plata(10, .9),
                                {'Delivery Charge': plata(16, .5)})
    ird['Lunch'] = servicio(random.randint(4, 14), plata(300, .4), plata(40, .8),
                            {'Delivery Charge': plata(40, .4)})
    ird['Dinner'] = servicio(random.randint(18, 40), plata(1250, .3), plata(110, .7),
                             {'Delivery Charge': plata(200, .3)})
    ird['Overnight'] = servicio(random.randint(0, 5), plata(55, .8), plata(8, .9),
                                {'Delivery Charge': plata(10, .6)})
    ird['All Day'] = sumar([ird['Breakfast'], ird['Lunch'], ird['Dinner'], ird['Overnight']],
                           ['Covers', 'Food', 'Beverage', 'Delivery Charge', 'Discounts'])
    areas['In Room Dining'] = ird

    # --- turnos ---
    # Cada persona trabaja siempre en la misma area: asi es en el hotel y asi
    # el sistema puede aprender quien es de donde. In Room Dining es el unico
    # que tiene turno de noche, que es donde entran los recargos.
    turnos = []
    for area, plantel, cuantos, horarios in [
        ('Penny Blue',     PLANTEL['Penny Blue'],     (2, 4), TURNOS_TIPO),
        ('Exchange Lane',  PLANTEL['Exchange Lane'],  (1, 3), TURNOS_TIPO),
        ('In Room Dining', PLANTEL['In Room Dining'], (1, 2), TURNOS_NOCHE),
    ]:
        for quien in random.sample(plantel, random.randint(*cuantos)):
            desde, hasta, desc = random.choice(horarios)
            span = (hasta - desde) if hasta > desde else (hasta + 1440 - desde)
            turnos.append({
                'quien': quien, 'desde': desde, 'hasta': hasta % 1440,
                'descanso': desc, 'horas': round((span - desc) / 60.0, 2),
                'area': area
            })

    # --- comentarios ---
    coment = []
    for area in ['Penny Blue', 'Exchange Lane', 'In Room Dining']:
        if random.random() < 0.55:
            coment.append({'texto': random.choice(COMENTARIOS[area]), 'area': area})

    return {'fecha': str(fecha), 'hoja': 'ejemplo', 'areas': areas,
            'comentarios': coment, 'turnos': turnos}


# --- tres meses, con dias salteados como en el archivo real ---
dias = []
hoy = datetime.date(2026, 8, 27)
inicio = datetime.date(2026, 6, 1)
f = inicio
while f <= hoy:
    if random.random() < 0.62:                       # no todos los dias
        evento = random.random() < 0.3
        dias.append(armar_dia(f, evento))
    f += datetime.timedelta(days=1)

js = ('/* Datos de EJEMPLO, generados. Ninguna cifra, nombre ni comentario\n'
      '   corresponde a un hotel real. Sirven para poder abrir la aplicacion\n'
      '   y ver como funciona.                                              */\n'
      'var DATOS_DEMO = ' +
      json.dumps(dias, ensure_ascii=False, indent=0, separators=(',', ':')) + ';\n'
      'if (typeof DATOS_REALES === "undefined") { var DATOS_REALES = DATOS_DEMO; }\n')

io.open('../app/js/datos-demo.js', 'w', encoding='utf-8').write(js)

print('DIAS:', len(dias))
print('TURNOS:', sum(len(d['turnos']) for d in dias))
print('COMENTARIOS:', sum(len(d['comentarios']) for d in dias))
print('PESO:', round(len(js) / 1024), 'KB')
tot = sum(d['areas']['Penny Blue']['All Day']['Total'] +
          d['areas']['Exchange Lane']['All Day']['Total'] +
          d['areas']['In Room Dining']['All Day']['Total'] for d in dias)
print('FACTURACION DE EJEMPLO: %.0f en %d dias' % (tot, len(dias)))
