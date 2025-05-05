          <div className="grid grid-cols-4 items-center gap-4">
            <label htmlFor="notes" className="text-right">
              ملاحظات
            </label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="col-span-3"
              placeholder="أدخل ملاحظاتك"
              rows={1}
            />
          </div> 