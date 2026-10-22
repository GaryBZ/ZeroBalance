BEGIN;

DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS limites_categoria CASCADE;
DROP TABLE IF EXISTS abonos_objetivo CASCADE;
DROP TABLE IF EXISTS gastos_recurrentes CASCADE;
DROP TABLE IF EXISTS objetivos_ahorro CASCADE;
DROP TABLE IF EXISTS configuracion_presupuesto CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;

CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE configuracion_presupuesto (
    id SERIAL PRIMARY KEY,
    ingreso_base NUMERIC(12, 2) NOT NULL DEFAULT 0,
    CONSTRAINT configuracion_presupuesto_ingreso_base_no_negativo
        CHECK (ingreso_base >= 0)
);

CREATE TABLE limites_categoria (
    id SERIAL PRIMARY KEY,
    categoria_id INTEGER NOT NULL,
    limite_monto NUMERIC(12, 2) NOT NULL,
    CONSTRAINT limites_categoria_limite_no_negativo
        CHECK (limite_monto >= 0),
    CONSTRAINT limites_categoria_categoria_fk
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT limites_categoria_categoria_unique
        UNIQUE (categoria_id)
);

CREATE TABLE movimientos (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(10) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    categoria_id INTEGER,
    CONSTRAINT movimientos_tipo_valido
        CHECK (tipo IN ('ingreso', 'gasto')),
    CONSTRAINT movimientos_monto_positivo
        CHECK (monto > 0),
    CONSTRAINT movimientos_categoria_fk
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id)
        ON UPDATE CASCADE
        ON DELETE SET NULL
);

CREATE TABLE objetivos_ahorro (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    monto_meta NUMERIC(12, 2) NOT NULL,
    monto_actual NUMERIC(12, 2) NOT NULL DEFAULT 0,
    fecha_limite DATE,
    estado VARCHAR(20) NOT NULL DEFAULT 'activo',
    CONSTRAINT objetivos_ahorro_monto_meta_positivo
        CHECK (monto_meta > 0),
    CONSTRAINT objetivos_ahorro_monto_actual_valido
        CHECK (monto_actual >= 0 AND monto_actual <= monto_meta),
    CONSTRAINT objetivos_ahorro_estado_valido
        CHECK (estado IN ('activo', 'pausado', 'completado', 'cancelado'))
);

CREATE TABLE abonos_objetivo (
    id SERIAL PRIMARY KEY,
    objetivo_id INTEGER NOT NULL REFERENCES objetivos_ahorro (id) ON DELETE CASCADE,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE gastos_recurrentes (
    id SERIAL PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL,
    monto NUMERIC(12, 2) NOT NULL CHECK (monto > 0),
    categoria_id INTEGER REFERENCES categorias (id) ON DELETE SET NULL,
    frecuencia VARCHAR(10) NOT NULL DEFAULT 'mensual'
        CHECK (frecuencia IN ('semanal', 'mensual', 'anual')),
    proxima_fecha DATE NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO categorias (nombre)
VALUES
    ('Alquiler'),
    ('Comida'),
    ('Ocio'),
    ('Servicios');

INSERT INTO configuracion_presupuesto (ingreso_base)
VALUES (3000);

INSERT INTO limites_categoria (categoria_id, limite_monto)
SELECT id, limite_monto
FROM (
    VALUES
        ('Alquiler', 1000.00::NUMERIC),
        ('Comida', 450.00::NUMERIC),
        ('Ocio', 250.00::NUMERIC),
        ('Servicios', 300.00::NUMERIC)
) AS limites(nombre, limite_monto)
INNER JOIN categorias AS categorias
    ON categorias.nombre = limites.nombre;

INSERT INTO objetivos_ahorro (nombre, monto_meta, monto_actual)
VALUES
    ('Viaje a Japón', 5000.00, 1200.00),
    ('PS5', 500.00, 100.00);

INSERT INTO abonos_objetivo (objetivo_id, monto)
SELECT id, monto_actual
FROM objetivos_ahorro
WHERE monto_actual > 0;

COMMIT;
