CREATE OR REPLACE FUNCTION public.send_updated_stats_for_lw14() RETURNS trigger
    SECURITY DEFINER
    SET search_path = ''
    LANGUAGE plpgsql
AS $$
DECLARE
    total_tickets INTEGER;
    platinum_tickets INTEGER;
    payload_saturation INTEGER;
    payload_fill NUMERIC;
BEGIN
    -- Count tickets
    SELECT COUNT(*) INTO total_tickets FROM public.tickets WHERE launch_week = 'lw14';
    SELECT COUNT(*) INTO platinum_tickets FROM public.tickets_view WHERE launch_week = 'lw14' AND platinum = true;
    
    payload_saturation := platinum_tickets / total_tickets::NUMERIC;
    
    payload_fill := 1.0 - 0.8 / (1.0 + (total_tickets::NUMERIC / 10.0));
    
    PERFORM realtime.send(
      jsonb_build_object('payload_saturation', payload_saturation, 'payload_fill', payload_fill), -- JSONB Payload
      'gauges-update', -- Event name
      'lw14', -- Topic
      false
    );
    RETURN NULL;
END;
$$;

CREATE TRIGGER broadcast_stats_for_lw14_tickets_insert_and_update
AFTER INSERT OR UPDATE ON public.tickets
FOR EACH ROW
WHEN (NEW.launch_week = 'lw14')
EXECUTE FUNCTION public.send_updated_stats_for_lw14();

CREATE TRIGGER broadcast_stats_for_lw14_tickets_delete
AFTER DELETE ON public.tickets
FOR EACH ROW
WHEN (OLD.launch_week = 'lw14')
EXECUTE FUNCTION public.send_updated_stats_for_lw14();
