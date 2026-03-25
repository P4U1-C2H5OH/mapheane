insert into profiles (id, name, role)
values ('c2c99194-02ba-4032-937e-18f695f07a30', 'Mapheane', 'admin')
on conflict (id) do update set role = 'admin', name = 'Mapheane';
