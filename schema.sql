--
-- PostgreSQL database dump
--

\restrict IKHY1hPOpR0cPaBLSrALZpm5TdHdHcHIi1y4yHiI4Hkpjwe97Ta6Y0jHZmmbNNW

-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: AiAnalysis; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."AiAnalysis" (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    type text,
    input_data text,
    result text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."AiAnalysis" OWNER TO postgres;

--
-- Name: AiAnalysis_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."AiAnalysis_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."AiAnalysis_id_seq" OWNER TO postgres;

--
-- Name: AiAnalysis_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."AiAnalysis_id_seq" OWNED BY public."AiAnalysis".id;


--
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."MedicalRecord" (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    clinic text,
    symptoms text,
    diagnosis text,
    prescription text,
    cost integer,
    photo_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    brief_name text NOT NULL
);


ALTER TABLE public."MedicalRecord" OWNER TO postgres;

--
-- Name: MedicalRecord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."MedicalRecord_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."MedicalRecord_id_seq" OWNER TO postgres;

--
-- Name: MedicalRecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."MedicalRecord_id_seq" OWNED BY public."MedicalRecord".id;


--
-- Name: Pet; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Pet" (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    name text NOT NULL,
    species text,
    birthdate timestamp(3) without time zone,
    photo_url text,
    chip_number text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    target_weight numeric(5,2)
);


ALTER TABLE public."Pet" OWNER TO postgres;

--
-- Name: Pet_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Pet_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Pet_id_seq" OWNER TO postgres;

--
-- Name: Pet_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Pet_id_seq" OWNED BY public."Pet".id;


--
-- Name: Reminder; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Reminder" (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    type text,
    due_date timestamp(3) without time zone NOT NULL,
    sent boolean DEFAULT false NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Reminder" OWNER TO postgres;

--
-- Name: Reminder_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Reminder_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Reminder_id_seq" OWNER TO postgres;

--
-- Name: Reminder_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Reminder_id_seq" OWNED BY public."Reminder".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id bigint NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text,
    provider text DEFAULT 'credentials'::text NOT NULL,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."User_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."User_id_seq" OWNER TO postgres;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: Vaccine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Vaccine" (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    vaccine_name text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    next_due_date timestamp(3) without time zone,
    clinic text,
    vet_name text,
    photo_url text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cost integer
);


ALTER TABLE public."Vaccine" OWNER TO postgres;

--
-- Name: Vaccine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Vaccine_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Vaccine_id_seq" OWNER TO postgres;

--
-- Name: Vaccine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Vaccine_id_seq" OWNED BY public."Vaccine".id;


--
-- Name: WeightRecord; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."WeightRecord" (
    id bigint NOT NULL,
    pet_id bigint NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    weight numeric(5,2) NOT NULL,
    notes text,
    created_at timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."WeightRecord" OWNER TO postgres;

--
-- Name: WeightRecord_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."WeightRecord_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."WeightRecord_id_seq" OWNER TO postgres;

--
-- Name: WeightRecord_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."WeightRecord_id_seq" OWNED BY public."WeightRecord".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: AiAnalysis id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AiAnalysis" ALTER COLUMN id SET DEFAULT nextval('public."AiAnalysis_id_seq"'::regclass);


--
-- Name: MedicalRecord id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord" ALTER COLUMN id SET DEFAULT nextval('public."MedicalRecord_id_seq"'::regclass);


--
-- Name: Pet id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet" ALTER COLUMN id SET DEFAULT nextval('public."Pet_id_seq"'::regclass);


--
-- Name: Reminder id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reminder" ALTER COLUMN id SET DEFAULT nextval('public."Reminder_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Name: Vaccine id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vaccine" ALTER COLUMN id SET DEFAULT nextval('public."Vaccine_id_seq"'::regclass);


--
-- Name: WeightRecord id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WeightRecord" ALTER COLUMN id SET DEFAULT nextval('public."WeightRecord_id_seq"'::regclass);


--
-- Name: AiAnalysis AiAnalysis_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AiAnalysis"
    ADD CONSTRAINT "AiAnalysis_pkey" PRIMARY KEY (id);


--
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- Name: Pet Pet_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_pkey" PRIMARY KEY (id);


--
-- Name: Reminder Reminder_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: Vaccine Vaccine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_pkey" PRIMARY KEY (id);


--
-- Name: WeightRecord WeightRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WeightRecord"
    ADD CONSTRAINT "WeightRecord_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: AiAnalysis AiAnalysis_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."AiAnalysis"
    ADD CONSTRAINT "AiAnalysis_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Pet Pet_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Pet"
    ADD CONSTRAINT "Pet_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Reminder Reminder_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Reminder"
    ADD CONSTRAINT "Reminder_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Vaccine Vaccine_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Vaccine"
    ADD CONSTRAINT "Vaccine_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: WeightRecord WeightRecord_pet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."WeightRecord"
    ADD CONSTRAINT "WeightRecord_pet_id_fkey" FOREIGN KEY (pet_id) REFERENCES public."Pet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict IKHY1hPOpR0cPaBLSrALZpm5TdHdHcHIi1y4yHiI4Hkpjwe97Ta6Y0jHZmmbNNW

