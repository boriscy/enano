# Methods added to this helper will be available to all templates in the application.
module ApplicationHelper
  def menu(pages)
    list = pages.map do |page|
      link = page.page_type_id == 1 ? {:id => page.to_param} : '#';
      "<li>#{link_to page.title, link, :class => (:selected unless @page.id!= page.id) }</li>"
    end
    list
  end
end
