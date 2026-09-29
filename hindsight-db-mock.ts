export function uuidv7() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

class MockEventsStore {
  private events: any[] = [];

  async insertMany(eventsToInsert: any[]) {
    this.events.push(...eventsToInsert);
  }

  async list(options: any) {
    const filters = options.filters || {};
    let matched = this.events;
    
    if (filters.entities) {
      const targetEntity = filters.entities;
      matched = matched.filter(ev => 
        ev.entities && ev.entities.includes(targetEntity)
      );
    }
    
    if (options.order === 'desc') {
      matched = [...matched].sort((a, b) => b.timestamp - a.timestamp);
    }
    
    if (options.limit) {
      matched = matched.slice(0, options.limit);
    }
    
    return { items: matched };
  }
}

export function openDatabase(options: any) {
  return {
    events: new MockEventsStore(),
    ready: async () => { return; }
  };
}
