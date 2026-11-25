export function initializeQuote() {
  const root = document.querySelector<HTMLElement>('[data-quote]');
  const fallback = document.querySelector<HTMLElement>('[data-quote-fallback]');
  if (!root || !fallback) return;

  const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-quote-step]'));
  const progress = root.querySelector<HTMLOListElement>('.quote-progress');
  const propertyOptions = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="property"]'));
  const priorityOptions = Array.from(root.querySelectorAll<HTMLInputElement>('input[name="priority"]'));
  const propertyError = root.querySelector<HTMLElement>('#property-error');
  const priorityError = root.querySelector<HTMLElement>('#priority-error');
  const reviewProperty = root.querySelector<HTMLElement>('[data-review-property]');
  const reviewPriorities = root.querySelector<HTMLUListElement>('[data-review-priorities]');
  if (!progress || !propertyError || !priorityError || !reviewProperty || !reviewPriorities) return;

  let active = 0;
  const progressItems = Array.from(progress.children);
  const options = [...propertyOptions, ...priorityOptions];
  const query = new URLSearchParams(location.search);

  function show(step: number, focus = true) {
    active = step;
    steps.forEach((section, index) => { section.hidden = index !== step; });
    progress!.hidden = step >= progressItems.length;
    progressItems.forEach((item, index) => {
      if (index === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
      item.classList.toggle('complete', index < step);
    });
    if (focus) steps[step]?.querySelector('h2')?.focus();
  }

  function validate(choices: HTMLInputElement[], error: HTMLElement, message: string) {
    if (choices.some((option) => option.checked)) return true;
    error.textContent = message;
    choices[0]?.focus();
    return false;
  }

  for (const option of options) option.checked = query.get(option.name) === option.value;

  root.addEventListener('change', (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement)) return;
    if (input.name === 'property') propertyError.textContent = '';
    if (input.name === 'priority') {
      priorityError.textContent = '';
      if (input.checked) {
        for (const other of priorityOptions) {
          if (other !== input && (input.value === 'guidance' || other.value === 'guidance')) {
            other.checked = false;
          }
        }
      }
    }
  });

  root.addEventListener('click', (event) => {
    const target = event.target;
    const button = target instanceof Element ? target.closest('button') : null;
    if (!button) return;
    if (button.hasAttribute('data-back')) show(active - 1);
    if (button.hasAttribute('data-next') && active === 0 &&
        validate(propertyOptions, propertyError, 'Choose the kind of property to continue.')) {
      show(1);
    } else if (button.hasAttribute('data-next') && active === 1 &&
        validate(priorityOptions, priorityError, 'Choose a priority or select “Help me decide”.')) {
      const property = propertyOptions.find((option) => option.checked);
      reviewProperty.textContent = property?.dataset.label ?? '';
      const listItems = priorityOptions.filter((option) => option.checked).map((option) => {
        const item = document.createElement('li');
        item.textContent = option.dataset.label ?? '';
        return item;
      });
      reviewPriorities.replaceChildren(...listItems);
      show(2);
    }
    if (button.hasAttribute('data-submit') && active === 2) show(3);
    if (button.hasAttribute('data-reset')) {
      for (const option of options) option.checked = false;
      propertyError.textContent = '';
      priorityError.textContent = '';
      reviewProperty.textContent = '';
      reviewPriorities.replaceChildren();
      if (location.search) history.replaceState(null, '', location.pathname + location.hash);
      show(0);
    }
  });

  show(0, false);
  fallback.hidden = true;
  root.hidden = false;
}
