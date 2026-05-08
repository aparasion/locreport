module Jekyll
  class SignalPage < Page
    def initialize(site, base, signal)
      @site = site
      @base = base
      @dir  = File.join("signals", signal["id"])
      @name = "index.html"

      self.process(@name)
      self.data = {
        "layout"      => "signal",
        "signal_id"   => signal["id"],
        "title"       => signal["title"],
        "description" => signal["description"],
        "permalink"   => "/signals/#{signal['id']}/"
      }
      self.content = ""
    end
  end

  class SignalPagesGenerator < Generator
    safe true
    priority :low

    def generate(site)
      signals = site.data["signals"]
      return unless signals.is_a?(Array)
      signals.each do |signal|
        next unless signal.is_a?(Hash) && signal["id"]
        site.pages << SignalPage.new(site, site.source, signal)
      end
    end
  end
end
