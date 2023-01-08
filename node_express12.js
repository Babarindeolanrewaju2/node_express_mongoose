// GET all records
app.get('/api/records', (req, res) => {
  Record.find((err, records) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(records);
  });
});

// GET one record by id
app.get('/api/records/:id', (req, res) => {
  Record.findById(req.params.id, (err, record) => {
    if (err) return res.status(500).send(err);
    if (!record) return res.status(404).send('Record not found');
    return res.status(200).send(record);
  });
});

// POST (create) a new record
app.post('/api/records', (req, res) => {
  const newRecord = new Record(req.body);
  newRecord.save((err, record) => {
    if (err) return res.status(500).send(err);
    return res.status(201).send(record);
  });
});

// PUT (update) an existing record
app.put('/api/records/:id', (req, res) => {
  Record.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, record) => {
      if (err) return res.status(500).send(err);
      return res.status(200).send(record);
    }
  );
});

// DELETE a record
app.delete('/api/records/:id', (req, res) => {
  Record.findByIdAndDelete(req.params.id, (err, record) => {
    if (err) return res.status(500).send(err);
    return res.status(200).send(record);
  });
});
