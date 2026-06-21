insert into public.messages (id, client_id, sender_id, sender_label, content, created_at)
values
  ('77777777-1111-4111-8111-111111111111', '11111111-1111-4111-8111-111111111111', null, 'MB', 'Seu relatorio financeiro de maio foi atualizado e ja esta disponivel no portal.', now() - interval '2 hours'),
  ('77777777-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', null, 'Cliente', 'Vamos enviar o extrato complementar ainda hoje.', now() - interval '90 minutes'),
  ('77777777-3333-4333-8333-333333333333', '22222222-2222-4222-8222-222222222222', null, 'MB', 'Identificamos erro de colunas no CSV de despesas. Reenvie com data, descricao, valor e categoria.', now() - interval '1 day'),
  ('77777777-4444-4444-8444-444444444444', '33333333-3333-4333-8333-333333333333', null, 'MB', 'Para concluir o onboarding, envie o contrato social e os XMLs da ultima competencia.', now() - interval '2 days')
on conflict (id) do update set
  content = excluded.content,
  sender_label = excluded.sender_label;
