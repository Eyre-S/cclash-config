drop table if exists tokens;
create table tokens (
    token text not null
        constraint tokens_pk
            primary key,
    name  text
);

drop table if exists templates_data;
create table templates_data (
    uuid    text not null
        constraint templates_pk
            primary key,
    content text,
    comment text
);

drop index if exists templates_identifiers_i_uuid_primary;
drop table if exists templates_identifiers;
create table templates_identifiers (
    uuid       text not null,
    name       text not null
        constraint templates_pk_name
            primary key,
    is_primary int  not null
        constraint templates_identifiers_ck_is_primary
            check (is_primary in (0, 1))
);
create index templates_identifiers_i_uuid
    on templates_identifiers (uuid);
create index templates_identifiers_i_uuid_primary
    on templates_identifiers (uuid, is_primary);

drop index if exists templates_configs_i_uuid;
drop table if exists templates_configs;
create table templates_configs (
    uuid        text not null,
    config_name text not null,
    is_raw      int  not null
        constraint templates_configs_ck_is_raw
            check (is_raw in (0, 1)),
    targets     text not null,
    constraint templates_configs_pk
        primary key (uuid, config_name)
);
create index templates_configs_i_uuid
    on templates_configs (uuid);
