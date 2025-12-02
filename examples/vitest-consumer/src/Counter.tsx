import React, { useState } from "react";

export interface CounterProps {
  initialCount?: number;
  label?: string;
}

export function Counter({ initialCount = 0, label = "Count" }: CounterProps) {
  const [count, setCount] = useState(initialCount);

  return (
    <div>
      <p data-testid="count-label">
        {label}: {count}
      </p>
      <button onClick={() => setCount(count + 1)} data-testid="increment">
        Increment
      </button>
      <button onClick={() => setCount(count - 1)} data-testid="decrement">
        Decrement
      </button>
      <button onClick={() => setCount(0)} data-testid="reset">
        Reset
      </button>
    </div>
  );
}
