ALTER DATABASE cowket DEFAULT CHARACTER SET = utf8;
ALTER TABLE cowket.alert_event AUTO_INCREMENT=1;
INSERT INTO cowket.alert_event (name)
SELECT 'message' FROM DUAL
WHERE NOT EXISTS (SELECT * FROM cowket.alert_event WHERE name = 'message' LIMIT 1);
INSERT INTO cowket.alert_event (name)
SELECT 'reaction' FROM DUAL
WHERE NOT EXISTS (SELECT * FROM cowket.alert_event WHERE name = 'reaction' LIMIT 1);
INSERT INTO cowket.alert_event (name)
SELECT 'mention' FROM DUAL
WHERE NOT EXISTS (SELECT * FROM cowket.alert_event WHERE name = 'mention' LIMIT 1);