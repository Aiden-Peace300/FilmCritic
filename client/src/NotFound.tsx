export default function NotFound() {
  return (
    <div className="Header-content">
      <div className="row">
        <div className="col text-center mb-5">
          <h3>Uh oh, we could not find the page you were looking for!</h3>
          {/* TODO: Make this a link to the Catalog, with className "text-muted" */}
        </div>
      </div>
    </div>
  );
}
